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
import { DevStagesService } from './dev-stages.service';
import { getCurrentUserId } from './current-user';

@Controller('dev-stages')
export class DevStagesController {
  constructor(private readonly devStagesService: DevStagesService) {}

  // GET 1: Плитка (с фильтром)
  @Get('grid')
  @Render('grid')
  async getGrid(
    @Query('minCost') minCost: string,
    @Query('maxCost') maxCost: string,
  ) {
    const min = parseInt(minCost, 10);
    const max = parseInt(maxCost, 10);
    const stages = await this.devStagesService.filterByCostRange(min, max);

    const stagesWithMeta = await Promise.all(
      stages.map(async (s) => ({
        ...s,
        likesCount: await this.devStagesService.countLikes(s.id),
        imageUrl: s.image
          ? `http://localhost:9000/dev-stages-media/${s.image}`
          : '/default/image.jpg',
      })),
    );

    return {
      stages: stagesWithMeta,
      minCost: minCost || '',
      maxCost: maxCost || '',
    };
  }

  // GET 2: Лента (по id или ?next=true)
  @Get('feed/:id')
  @Render('feed')
  async getFeed(@Param('id') id: string, @Query('next') next: string) {
    const stageId = parseInt(id, 10);
    let stage = await this.devStagesService.getById(stageId);

    if (next === 'true') {
      const nextStage = await this.devStagesService.getNextAfter(stageId);
      if (nextStage) stage = nextStage;
    }

    if (!stage) {
      return { stage: null, error: 'Этап не найден или удалён' };
    }

    const likesCount = await this.devStagesService.countLikes(stage.id);

    return {
      stage,
      likesCount,
      imageUrl: stage.image
        ? `http://localhost:9000/dev-stages-media/${stage.image}`
        : '/default/image.jpg',
      videoUrl: stage.video
        ? `http://localhost:9000/dev-stages-media/${stage.video}`
        : '/default/video.mp4',
    };
  }

  // GET 3: Получение черновика текущего пользователя
  @Get('add')
  @Render('add')
  async getAdd() {
    const userId = getCurrentUserId();
    const draft = await this.devStagesService.getDraft(userId);

    if (!draft) {
      return { stage: null, draftExists: false };
    }

    return {
      stage: draft,
      draftExists: true,
      imageUrl: draft.image
        ? `http://localhost:9000/dev-stages-media/${draft.image}`
        : '/default/image.jpg',
      videoUrl: draft.video
        ? `http://localhost:9000/dev-stages-media/${draft.video}`
        : '/default/video.mp4',
    };
  }

  // POST 4: Создание черновика через ORM
  @Post('add')
  @Redirect('/dev-stages/add', 302)
  async createDraft(@Body() body: any) {
    const userId = getCurrentUserId();
    const existing = await this.devStagesService.getDraft(userId);
    if (existing) return;

    await this.devStagesService.createDraft(
      {
        stageName: body.stageName || 'Новый этап',
        stageDescription: body.stageDescription || 'Описание',
        image: body.image || 'draft.jpg',
        video: body.video || 'draft.mp4',
        laborIntensity: parseInt(body.laborIntensity, 10) || 0,
        hourlyRate: parseInt(body.hourlyRate, 10) || 0,
        stageCost: parseInt(body.stageCost, 10) || 0,
        teamSize: parseInt(body.teamSize, 10) || 1,
        durationDays: parseInt(body.durationDays, 10) || 0,
      },
      userId,
    );
  }

  // POST 5: Публикация через ORM
  @Post('publish')
  @Redirect('/dev-stages/grid', 302)
  async publish(@Body('id') id: string) {
    const stageId = parseInt(id, 10);
    if (!isNaN(stageId)) {
      await this.devStagesService.publishStage(stageId);
    }
  }

  // POST 6: Логическое удаление через SQL UPDATE
  @Post('delete')
  @Redirect('/dev-stages/grid', 302)
  async delete(@Body('id') id: string) {
    const stageId = parseInt(id, 10);
    if (!isNaN(stageId)) {
      await this.devStagesService.softDelete(stageId);
    }
  }
}