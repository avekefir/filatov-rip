import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { DevelopmentStagesService } from './development_stages.service';

@Controller('development_stages')
export class DevelopmentStagesController {
  constructor(
    private readonly developmentStagesService: DevelopmentStagesService,
  ) {}

  // GET 1: Лента — по id или ?next=true
  @Get('feed/:id')
  @Render('feed')
  getFeed(@Param('id') id: string, @Query('next') next: string) {
    const stageId = parseInt(id, 10);
    let stage = this.developmentStagesService.getById(stageId);
    if (next === 'true') {
      const nextStage = this.developmentStagesService.getNextAfter(stageId);
      if (nextStage) stage = nextStage;
    }
    if (!stage || stage.status === 'deleted') {
      return { stage: null, error: 'Этап не найден' };
    }
    return {
      stage,
      likesCount: stage.likes?.length || 0,
      imageUrl: `http://localhost:9000/development-stages-media/${stage.image}`,
      videoUrl: `http://localhost:9000/development-stages-media/${stage.video}`,
    };
  }

  // GET 2: Добавление — получение черновика
  @Get('add')
  @Render('add')
  getAdd() {
    const draft = this.developmentStagesService.getDraft();
    if (!draft) return { stage: null, error: 'Черновик не найден' };
    return {
      stage: draft,
      imageUrl: `http://localhost:9000/development-stages-media/${draft.image}`,
      videoUrl: `http://localhost:9000/development-stages-media/${draft.video}`,
    };
  }

  // GET 3: Плитка — список с фильтром по максимальной стоимости за час
  @Get('grid')
  @Render('grid')
  getGrid(@Query('maxCostPerHour') maxCostPerHour: string) {
    const max = parseInt(maxCostPerHour, 10);
    const stages = this.developmentStagesService.filterByMaxCostPerHour(max);
    const stagesWithMeta = stages.map((s) => ({
      ...s,
      likesCount: s.likes?.length || 0,
      imageUrl: `http://localhost:9000/development-stages-media/${s.image}`,
    }));
    return {
      stages: stagesWithMeta,
      maxCostPerHour: maxCostPerHour || '',
    };
  }
}