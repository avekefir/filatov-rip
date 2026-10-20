import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DevelopmentStagesService } from './development_stages.service';
import { CreateDevelopmentStageDto } from './dto/create-development_stage.dto';
import { FilterDevelopmentStageDto } from './dto/filter-development_stage.dto';
import { LikeDto } from './dto/like.dto';
import { SessionGuard } from '../auth/guards/session.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('Услуги (Development Stages)')
@ApiCookieAuth('sessionId') // Указывает Swagger, что методы используют куку
@Controller('api/development_stages')
export class DevelopmentStagesApiController {
  constructor(
    private readonly developmentStagesService: DevelopmentStagesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список опубликованных услуг с фильтром (доступно всем)' })
  async getAll(
    @Query() filters: FilterDevelopmentStageDto,
    @CurrentUser() user?: User, // Гость тоже может смотреть
  ) {
    // Если гость, передаем userId = 0
    const userId = user ? user.id : 0;
    return this.developmentStagesService.findAll(filters, userId);
  }

  @Get('draft')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Получить черновик текущего пользователя' })
  async getDraft(@CurrentUser() user: User) {
    return this.developmentStagesService.getDraft(user.id);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Лента (первая карточка) — доступно всем' })
  async getFeedFirst(@CurrentUser() user?: User) {
    const userId = user ? user.id : 0;
    return this.developmentStagesService.getFeed(1, false, userId);
  }

  @Get('feed/:id')
  @ApiOperation({ summary: 'Лента по ID или ?next=true' })
  async getFeed(
    @Param('id', ParseIntPipe) id: number,
    @Query('next') next: string,
    @CurrentUser() user?: User,
  ) {
    const userId = user ? user.id : 0;
    return this.developmentStagesService.getFeed(id, next === 'true', userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Одна услуга по ID' })
  async getOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ) {
    const userId = user ? user.id : 0;
    return this.developmentStagesService.getFeed(id, false, userId);
  }

  @Post()
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Создание услуги (только авторизованные)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stageName: { type: 'string' },
        stageDescription: { type: 'string' },
        costPerHour: { type: 'number' },
        maxTeamSize: { type: 'number' },
        image: { type: 'string', format: 'binary' },
        video: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 },
      },
    ),
  )
  async create(
    @Body() dto: CreateDevelopmentStageDto,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @CurrentUser() user: User,
  ) {
    const image = files?.image?.[0];
    const video = files?.video?.[0];
    return this.developmentStagesService.create(dto, image, video, user.id);
  }

  @Put(':id/publish')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Публикация услуги' })
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.developmentStagesService.publish(id, user.id);
  }

  @Delete(':id')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Удаление услуги (только свои)' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.developmentStagesService.remove(id, user.id);
    return {};
  }

  @Post(':id/like')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Поставить/убрать лайк (value: 0 или 1)' })
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LikeDto,
    @CurrentUser() user: User,
  ) {
    return this.developmentStagesService.like(id, dto.value, user.id);
  }
}