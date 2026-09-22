import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { DevStagesService } from './dev-stages.service';

@Controller('dev-stages')
export class DevStagesController {
  constructor(private readonly devStagesService: DevStagesService) {}

  @Get('feed/:id')
  @Render('feed')
  getFeed(
    @Param('id') id: string,
    @Query('next') next: string,
  ) {
    const stageId = parseInt(id, 10);
    let stage = this.devStagesService.getById(stageId);
    if (next === 'true') {
      const nextStage = this.devStagesService.getNextAfter(stageId);
      if (nextStage) stage = nextStage;
    }
    if (!stage || stage.status === 'deleted') {
      return { stage: null, error: 'Этап не найден' };
    }
    return {
      stage,
      likesCount: stage.likes?.length || 0,
      imageUrl: `http://localhost:9000/dev-stages-media/${stage.image}`,
      videoUrl: `http://localhost:9000/dev-stages-media/${stage.video}`,
    };
  }

  @Get('add')
  @Render('add')
  getAdd() {
    const draft = this.devStagesService.getDraft();
    if (!draft) return { stage: null, error: 'Черновик не найден' };
    return {
      stage: draft,
      imageUrl: `http://localhost:9000/dev-stages-media/${draft.image}`,
      videoUrl: `http://localhost:9000/dev-stages-media/${draft.video}`,
    };
  }

  @Get('grid')
  @Render('grid')
  getGrid(
    @Query('minCost') minCost: string,
    @Query('maxCost') maxCost: string,
  ) {
    const min = parseInt(minCost, 10);
    const max = parseInt(maxCost, 10);
    const stages = this.devStagesService.filterByCostRange(min, max);
    const stagesWithMeta = stages.map(s => ({
      ...s,
      likesCount: s.likes?.length || 0,
      imageUrl: `http://localhost:9000/dev-stages-media/${s.image}`,
    }));
    return {
      stages: stagesWithMeta,
      minCost: minCost || '',
      maxCost: maxCost || '',
    };
  }
}