import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevelopmentStage } from './entities/development_stages.entity';
import { StageLike } from './entities/stage_like.entity';

@Injectable()
export class DevelopmentStagesService {
  constructor(
    @InjectRepository(DevelopmentStage)
    private readonly stageRepo: Repository<DevelopmentStage>,
    @InjectRepository(StageLike)
    private readonly likeRepo: Repository<StageLike>,
  ) {}

  // 1. Список опубликованных (плитка) с фильтром по макс. стоимости за час — ORM
  async filterByMaxCostPerHour(maxCostPerHour: number): Promise<DevelopmentStage[]> {
    const qb = this.stageRepo
      .createQueryBuilder('stage')
      .leftJoinAndSelect('stage.likes', 'like')
      .where('stage.status = :status', { status: 'published' });

    if (!isNaN(maxCostPerHour)) {
      qb.andWhere('stage.costPerHour <= :max', { max: maxCostPerHour });
    }

    return qb.orderBy('stage.id', 'ASC').getMany();
  }

  // 2. Одна запись по id — raw SQL (курсор)
  async getById(id: number): Promise<DevelopmentStage | null> {
    const rows = await this.stageRepo.query(
      `SELECT * FROM development_stages WHERE id = $1 AND status != 'deleted'`,
      [id],
    );
    if (rows.length === 0) return null;

    const likes = await this.likeRepo.find({ where: { stageId: id } });
    return { ...rows[0], likes };
  }

  // Следующий опубликованный (циклически) — raw SQL
  async getNextAfter(id: number): Promise<DevelopmentStage | null> {
    const rows = await this.stageRepo.query(
      `SELECT id FROM development_stages
       WHERE status = 'published' AND id > $1
       ORDER BY id ASC
       LIMIT 1`,
      [id],
    );

    let nextId: number;

    if (rows.length > 0) {
      nextId = rows[0].id;
    } else {
      const firstRows = await this.stageRepo.query(
        `SELECT id FROM development_stages
         WHERE status = 'published'
         ORDER BY id ASC
         LIMIT 1`,
      );
      if (firstRows.length === 0) return null;
      nextId = firstRows[0].id;
    }

    return this.getById(nextId);
  }

  // 3. Черновик текущего пользователя — ORM
  async getDraft(userId: number): Promise<DevelopmentStage | null> {
    return this.stageRepo.findOne({
      where: { status: 'draft', creatorId: userId },
      relations: { likes: true },
    });
  }

  // 4. Создание черновика — ORM
  async createDraft(
    dto: Partial<DevelopmentStage>,
    userId: number,
  ): Promise<DevelopmentStage> {
    const stage = this.stageRepo.create({
      ...dto,
      status: 'draft',
      creatorId: userId,
    });
    return this.stageRepo.save(stage);
  }

  // 5. Публикация — ORM (смена статуса)
  async publishStage(id: number): Promise<DevelopmentStage> {
    const stage = await this.stageRepo.findOne({ where: { id } });
    if (!stage) throw new NotFoundException('Этап не найден');
    if (stage.status === 'deleted') {
      throw new NotFoundException('Этап удалён');
    }
    stage.status = 'published';
    stage.publishedAt = new Date();
    return this.stageRepo.save(stage);
  }

  // 6. Логическое удаление — raw SQL (UPDATE), БЕЗ ORM
  async softDelete(id: number): Promise<void> {
    await this.stageRepo.query(
      `UPDATE development_stages SET status = 'deleted' WHERE id = $1`,
      [id],
    );
  }

  // Подсчёт лайков — ORM
  async countLikes(stageId: number): Promise<number> {
    return this.likeRepo.count({ where: { stageId } });
  }
}