import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevStage } from './entities/dev-stage.entity';
import { StageLike } from './entities/stage-like.entity';

@Injectable()
export class DevStagesService {
  constructor(
    @InjectRepository(DevStage)
    private readonly stageRepo: Repository<DevStage>,
    @InjectRepository(StageLike)
    private readonly likeRepo: Repository<StageLike>,
  ) {}

  // Список опубликованных (для плитки) с фильтром по стоимости
  async filterByCostRange(minCost: number, maxCost: number): Promise<DevStage[]> {
    const qb = this.stageRepo
      .createQueryBuilder('stage')
      .leftJoinAndSelect('stage.likes', 'like')
      .where('stage.status = :status', { status: 'published' });

    if (!isNaN(minCost)) {
      qb.andWhere('stage.stageCost >= :min', { min: minCost });
    }
    if (!isNaN(maxCost)) {
      qb.andWhere('stage.stageCost <= :max', { max: maxCost });
    }

    return qb.orderBy('stage.id', 'ASC').getMany();
  }

  // Через КУРСОР (raw SQL) — как требует методичка
  async getById(id: number): Promise<DevStage | null> {
    const rows = await this.stageRepo.query(
      `SELECT * FROM dev_stages WHERE id = $1 AND status != 'deleted'`,
      [id],
    );
    if (rows.length === 0) return null;

    const likes = await this.likeRepo.find({ where: { stageId: id } });
    return { ...rows[0], likes };
  }

  // Следующий опубликованный (циклически) — БЕЗ загрузки всего списка
  async getNextAfter(id: number): Promise<DevStage | null> {
    // Ищем первую запись с id > текущего среди опубликованных
    const rows = await this.stageRepo.query(
      `SELECT id FROM dev_stages
      WHERE status = 'published' AND id > $1
      ORDER BY id ASC
      LIMIT 1`,
      [id],
    );

    let nextId: number;

    if (rows.length > 0) {
      nextId = rows[0].id;
    } else {
      // Если следующий не найден — берём первый опубликованный (циклический переход)
      const firstRows = await this.stageRepo.query(
        `SELECT id FROM dev_stages
        WHERE status = 'published'
        ORDER BY id ASC
        LIMIT 1`,
      );
      if (firstRows.length === 0) return null;
      nextId = firstRows[0].id;
    }

    return this.getById(nextId);
  }

  // Черновик текущего пользователя (не более 1)
  async getDraft(userId: number): Promise<DevStage | null> {
    return this.stageRepo.findOne({
      where: { status: 'draft', creatorId: userId },
      relations: { likes: true },
    });
  }

  // Создание новой записи через ORM (черновик)
  async createDraft(dto: Partial<DevStage>, userId: number): Promise<DevStage> {
    const stage = this.stageRepo.create({
      ...dto,
      status: 'draft',
      creatorId: userId,
    });
    return this.stageRepo.save(stage);
  }

  // Публикация через ORM (смена статуса)
  async publishStage(id: number): Promise<DevStage> {
    const stage = await this.stageRepo.findOne({ where: { id } });
    if (!stage) throw new NotFoundException('Этап не найден');
    if (stage.status === 'deleted') {
      throw new NotFoundException('Этап удалён');
    }
    stage.status = 'published';
    stage.publishedAt = new Date();
    return this.stageRepo.save(stage);
  }

  // Логическое удаление через SQL UPDATE, БЕЗ ORM
  async softDelete(id: number): Promise<void> {
    await this.stageRepo.query(
      `UPDATE dev_stages SET status = 'deleted' WHERE id = $1`,
      [id],
    );
  }

  // Подсчёт лайков
  async countLikes(stageId: number): Promise<number> {
    return this.likeRepo.count({ where: { stageId } });
  }
}