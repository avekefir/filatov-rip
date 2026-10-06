import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Render,
  Body,
  Redirect,
} from '@nestjs/common';
import { DevelopmentStagesService } from './development_stages.service';
import { getCurrentUserId } from './current-user';

@Controller('development_stages')
export class DevelopmentStagesController {
  constructor(
    private readonly developmentStagesService: DevelopmentStagesService,
  ) {}

  // GET 1: Плитка — список с фильтром по макс. стоимости за час
  @Get('grid')
  @Render('grid')
  async getGrid(@Query('maxCostPerHour') maxCostPerHour: string) {
    const max = parseInt(maxCostPerHour, 10);
    const stages = await this.developmentStagesService.filterByMaxCostPerHour(max);

    const stagesWithMeta = await Promise.all(
      stages.map(async (s) => ({
        ...s,
        likesCount: await this.developmentStagesService.countLikes(s.id),
        imageUrl: s.image
          ? `http://localhost:9000/development-stages-media/${s.image}`
          : '/default/image.jpg',
      })),
    );

    return {
      stages: stagesWithMeta,
      maxCostPerHour: maxCostPerHour || '',
    };
  }

  // GET 2: Лента — по id или ?next=true
  @Get('feed/:id')
  @Render('feed')
  async getFeed(@Param('id') id: string, @Query('next') next: string) {
    const stageId = parseInt(id, 10);
    let stage = await this.developmentStagesService.getById(stageId);

    if (next === 'true') {
      const nextStage = await this.developmentStagesService.getNextAfter(stageId);
      if (nextStage) stage = nextStage;
    }

    if (!stage) {
      return { stage: null, error: 'Этап не найден или удалён' };
    }

    const likesCount = await this.developmentStagesService.countLikes(stage.id);

    return {
      stage,
      likesCount,
      imageUrl: stage.image
        ? `http://localhost:9000/development-stages-media/${stage.image}`
        : '/default/image.jpg',
      videoUrl: stage.video
        ? `http://localhost:9000/development-stages-media/${stage.video}`
        : '/default/video.mp4',
    };
  }

  // GET 3: Добавление — получение черновика текущего пользователя
  @Get('add')
  @Render('add')
  async getAdd() {
    const userId = getCurrentUserId();

    // Ловим 404, если черновика нет — вместо этого показываем форму создания
    let draft = null;
    try {
      draft = await this.developmentStagesService.getDraft(userId);
    } catch {
      draft = null;
    }

    if (!draft) {
      return { stage: null, draftExists: false };
    }

    return {
      stage: draft,
      draftExists: true,
      imageUrl: draft.image
        ? `http://localhost:9000/development-stages-media/${draft.image}`
        : '/default/image.jpg',
      videoUrl: draft.video
        ? `http://localhost:9000/development-stages-media/${draft.video}`
        : '/default/video.mp4',
    };
  }

  // POST 4: Создание черновика — ORM
  @Post('add')
  @Redirect('/development_stages/add', 302)
  async createDraft(@Body() body: any) {
    const userId = getCurrentUserId();

    // Проверяем, есть ли уже черновик (без выброса исключения)
    let existing = null;
    try {
      existing = await this.developmentStagesService.getDraft(userId);
    } catch {
      existing = null;
    }
    if (existing) return;

    await this.developmentStagesService.createDraft(
      {
        stageName: body.stageName || 'Новый этап',
        stageDescription: body.stageDescription || 'Описание',
        image: body.image || 'draft.jpg',
        video: body.video || 'draft.mp4',
        costPerHour: parseInt(body.costPerHour, 10) || 0,
        maxTeamSize: parseInt(body.maxTeamSize, 10) || 1,
      },
      userId,
    );
  }

  // POST 5: Публикация — ORM
  @Post('publish')
  @Redirect('/development_stages/grid', 302)
  async publish(@Body('id') id: string) {
    const stageId = parseInt(id, 10);
    if (!isNaN(stageId)) {
      await this.developmentStagesService.publishStage(stageId);
    }
  }

  // POST 6: Логическое удаление — raw SQL UPDATE
  @Post('delete')
  @Redirect('/development_stages/grid', 302)
  async delete(@Body('id') id: string) {
    const stageId = parseInt(id, 10);
    if (!isNaN(stageId)) {
      await this.developmentStagesService.softDelete(stageId);
    }
  }
}