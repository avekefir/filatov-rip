import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TypeOrmDevelopmentStagesRepository } from './repositories/typeorm-development_stages.repository';
import { TypeOrmUsersRepository } from './repositories/typeorm-users.repository';
import { MinioService } from './services/minio.service';
import { DevelopmentStage } from './entities/development_stages.entity';
import { CreateDevelopmentStageDto } from './dto/create-development_stage.dto';
import { UpdateDevelopmentStageDto } from './dto/update-development_stage.dto';
import { FilterDevelopmentStageDto } from './dto/filter-development_stage.dto';
import { DevelopmentStageResponseDto } from './dto/development_stage-response.dto';

@Injectable()
export class DevelopmentStagesService {
  constructor(
    private readonly stagesRepo: TypeOrmDevelopmentStagesRepository,
    private readonly usersRepo: TypeOrmUsersRepository,
    private readonly minioService: MinioService,
  ) {}

  // Преобразование сущности в DTO ответа
  private async toResponseDto(
    stage: DevelopmentStage,
    currentUserId: number,
  ): Promise<DevelopmentStageResponseDto> {
    const likesCount = await this.stagesRepo.countLikes(stage.id);
    const like = await this.stagesRepo.findLike(currentUserId, stage.id);

    const dto = new DevelopmentStageResponseDto();
    dto.id = stage.id;
    dto.stageName = stage.stageName;
    dto.stageDescription = stage.stageDescription;
    dto.status = stage.status;
    dto.image = this.minioService.getFileUrl(stage.image);
    dto.video = this.minioService.getFileUrl(stage.video);
    dto.costPerHour = stage.costPerHour;
    dto.maxTeamSize = stage.maxTeamSize;
    dto.likesCount = likesCount;
    dto.isMyStage = stage.creatorId === currentUserId;
    dto.isLikedByMe = !!like;
    dto.createdAt = stage.createdAt;
    dto.publishedAt = stage.publishedAt;

    return dto;
  }

  // Список опубликованных с фильтром
  async findAll(
    filters: FilterDevelopmentStageDto,
    currentUserId: number,
  ): Promise<DevelopmentStageResponseDto[]> {
    const stages = await this.stagesRepo.findAllPublished(filters);
    return Promise.all(
      stages.map((s) => this.toResponseDto(s, currentUserId)),
    );
  }

  // Лента (по id или следующий)
  async getFeed(
    id: number,
    next: boolean,
    currentUserId: number,
  ): Promise<DevelopmentStageResponseDto> {
    const stage = next
      ? await this.stagesRepo.findNextPublished(id)
      : await this.stagesRepo.findById(id);

    if (!stage || stage.status === 'deleted') {
      throw new NotFoundException('Этап не найден или удалён');
    }

    return this.toResponseDto(stage, currentUserId);
  }

  // Получение черновика текущего пользователя
  async getDraft(currentUserId: number): Promise<DevelopmentStageResponseDto> {
    const draft = await this.stagesRepo.findDraftByUser(currentUserId);
    if (!draft) {
      throw new NotFoundException('Черновик не найден');
    }
    return this.toResponseDto(draft, currentUserId);
  }

  // Создание с загрузкой файлов
  async create(
    dto: CreateDevelopmentStageDto,
    image: Express.Multer.File | undefined,
    video: Express.Multer.File | undefined,
    currentUserId: number,
  ): Promise<DevelopmentStageResponseDto> {
    const user = await this.usersRepo.findById(currentUserId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    let imageName: string | undefined = undefined;
    let videoName: string | undefined = undefined;

    if (image) {
      imageName = await this.minioService.uploadFile(image, 'image');
    }
    if (video) {
      videoName = await this.minioService.uploadFile(video, 'video');
    }

    const stage = await this.stagesRepo.create({
      stageName: dto.stageName,
      stageDescription: dto.stageDescription,
      costPerHour: dto.costPerHour,
      maxTeamSize: dto.maxTeamSize,
      image: imageName,
      video: videoName,
      status: 'draft',
      creatorId: currentUserId,
    });

    return this.toResponseDto(stage, currentUserId);
  }

  // Публикация
  async publish(
    id: number,
    currentUserId: number,
  ): Promise<DevelopmentStageResponseDto> {
    const stage = await this.stagesRepo.findById(id);
    if (!stage) throw new NotFoundException('Этап не найден');
    if (stage.status === 'deleted') {
      throw new BadRequestException('Этап удалён');
    }
    if (stage.creatorId !== currentUserId) {
      throw new ForbiddenException('Это не ваш этап');
    }
    if (stage.status === 'published') {
      throw new BadRequestException('Этап уже опубликован');
    }

    const updated = await this.stagesRepo.publish(id);
    return this.toResponseDto(updated, currentUserId);
  }

  // Soft delete (только свои)
  async remove(id: number, currentUserId: number): Promise<void> {
    const stage = await this.stagesRepo.findById(id);
    if (!stage || stage.status === 'deleted') {
      throw new NotFoundException('Этап не найден');
    }
    if (stage.creatorId !== currentUserId) {
      throw new ForbiddenException('Это не ваш этап');
    }

    await this.stagesRepo.softDelete(id);
  }

  // Лайк (0 — убрать, 1 — поставить)
  async like(
    id: number,
    value: number,
    currentUserId: number,
  ): Promise<DevelopmentStageResponseDto> {
    const stage = await this.stagesRepo.findById(id);
    if (!stage || stage.status !== 'published') {
      throw new NotFoundException('Этап не найден или не опубликован');
    }

    const existing = await this.stagesRepo.findLike(currentUserId, id);

    if (value === 1 && !existing) {
      await this.stagesRepo.addLike(currentUserId, id);
    } else if (value === 0 && existing) {
      await this.stagesRepo.removeLike(currentUserId, id);
    }

    return this.toResponseDto(stage, currentUserId);
  }
    // ============ Методы для SSR-контроллера (Lab 1 / Lab 2) ============

  async filterByMaxCostPerHour(maxCostPerHour: number): Promise<DevelopmentStage[]> {
    return this.stagesRepo.findAllPublished({
      maxCostPerHour: isNaN(maxCostPerHour) ? undefined : maxCostPerHour,
    });
  }

  async getById(id: number): Promise<DevelopmentStage | null> {
    const stage = await this.stagesRepo.findById(id);
    if (!stage || stage.status === 'deleted') return null;
    return stage;
  }

  async getNextAfter(id: number): Promise<DevelopmentStage | null> {
    return this.stagesRepo.findNextPublished(id);
  }

  async createDraft(
    dto: Partial<DevelopmentStage>,
    userId: number,
  ): Promise<DevelopmentStage> {
    return this.stagesRepo.create({
      ...dto,
      status: 'draft',
      creatorId: userId,
    });
  }

  async publishStage(id: number): Promise<DevelopmentStage> {
    return this.stagesRepo.publish(id);
  }

  async softDelete(id: number): Promise<void> {
    return this.stagesRepo.softDelete(id);
  }

  async countLikes(stageId: number): Promise<number> {
    return this.stagesRepo.countLikes(stageId);
  }
}