import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { DevelopmentStage } from '../entities/development_stages.entity';
import { StageLike } from '../entities/stage_like.entity';
import { FilterDevelopmentStageDto } from '../dto/filter-development_stage.dto';

@Injectable()
export class TypeOrmDevelopmentStagesRepository {
  constructor(
    @InjectRepository(DevelopmentStage)
    private readonly stageRepo: Repository<DevelopmentStage>,
    @InjectRepository(StageLike)
    private readonly likeRepo: Repository<StageLike>,
  ) {}

  // Список опубликованных с фильтрацией
  async findAllPublished(
    filters: FilterDevelopmentStageDto,
  ): Promise<DevelopmentStage[]> {
    const qb = this.stageRepo
      .createQueryBuilder('stage')
      .leftJoinAndSelect('stage.likes', 'like')
      .where('stage.status = :status', { status: 'published' });

    if (filters?.search) {
      qb.andWhere(
        '(stage.stageName ILIKE :search OR stage.stageDescription ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.maxCostPerHour !== undefined) {
      qb.andWhere('stage.costPerHour <= :maxCost', {
        maxCost: filters.maxCostPerHour,
      });
    }

    if (filters?.minTeamSize !== undefined) {
      qb.andWhere('stage.maxTeamSize >= :minTeam', {
        minTeam: filters.minTeamSize,
      });
    }

    return qb.orderBy('stage.id', 'ASC').getMany();
  }

  // Одна запись по id
  async findById(id: number): Promise<DevelopmentStage | null> {
    return this.stageRepo.findOne({
      where: { id },
      relations: { likes: true },
    });
  }

  // Черновик пользователя
  async findDraftByUser(userId: number): Promise<DevelopmentStage | null> {
    return this.stageRepo.findOne({
      where: { status: 'draft', creatorId: userId },
      relations: { likes: true },
    });
  }

  // Следующий опубликованный (циклически)
  async findNextPublished(id: number): Promise<DevelopmentStage | null> {
    const rows = await this.stageRepo.query(
      `SELECT id FROM development_stages
       WHERE status = 'published' AND id > $1
       ORDER BY id ASC LIMIT 1`,
      [id],
    );

    let nextId: number;

    if (rows.length > 0) {
      nextId = rows[0].id;
    } else {
      const firstRows = await this.stageRepo.query(
        `SELECT id FROM development_stages
         WHERE status = 'published'
         ORDER BY id ASC LIMIT 1`,
      );
      if (firstRows.length === 0) return null;
      nextId = firstRows[0].id;
    }

    return this.findById(nextId);
  }

  // Создание
  async create(data: Partial<DevelopmentStage>): Promise<DevelopmentStage> {
    const stage = this.stageRepo.create(data);
    return this.stageRepo.save(stage);
  }

  // Обновление
  async update(
    id: number,
    data: Partial<DevelopmentStage>,
  ): Promise<DevelopmentStage> {
    await this.stageRepo.update(id, data);
    const updated = await this.findById(id);
    return updated!;
  }

  // Публикация через ORM
  async publish(id: number): Promise<DevelopmentStage> {
    await this.stageRepo.update(id, {
      status: 'published',
      publishedAt: new Date(),
    });
    return (await this.findById(id))!;
  }

  // Soft delete через raw SQL
  async softDelete(id: number): Promise<void> {
    await this.stageRepo.query(
      `UPDATE development_stages SET status = 'deleted' WHERE id = $1`,
      [id],
    );
  }

  // Лайки
  async findLike(userId: number, stageId: number): Promise<StageLike | null> {
    return this.likeRepo.findOne({ where: { userId, stageId } });
  }

  async addLike(userId: number, stageId: number): Promise<void> {
    await this.likeRepo.save({ userId, stageId });
  }

  async removeLike(userId: number, stageId: number): Promise<void> {
    await this.likeRepo.delete({ userId, stageId });
  }

  async countLikes(stageId: number): Promise<number> {
    return this.likeRepo.count({ where: { stageId } });
  }
}