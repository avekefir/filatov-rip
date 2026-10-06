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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DevelopmentStagesService } from './development_stages.service';
import { CreateDevelopmentStageDto } from './dto/create-development_stage.dto';
import { FilterDevelopmentStageDto } from './dto/filter-development_stage.dto';
import { LikeDto } from './dto/like.dto';
import { getCurrentUserId } from './current-user';

@Controller('api/development_stages')
export class DevelopmentStagesApiController {
  constructor(
    private readonly developmentStagesService: DevelopmentStagesService,
  ) {}

  // GET список опубликованных с фильтром
  @Get()
  async getAll(@Query() filters: FilterDevelopmentStageDto) {
    const userId = getCurrentUserId();
    return this.developmentStagesService.findAll(filters, userId);
  }

  // GET черновик текущего пользователя
  // (важно: этот маршрут ВЫШЕ, чем '/:id')
  @Get('draft')
  async getDraft() {
    const userId = getCurrentUserId();
    return this.developmentStagesService.getDraft(userId);
  }

  // GET лента (без id или с ?next=true) — вообще-то нужен ид
  // Сначала опишем /feed
  @Get('feed')
  async getFeedFirst() {
    // без id возвращаем первый опубликованный
    const userId = getCurrentUserId();
    return this.developmentStagesService.getFeed(1, false, userId);
  }

  // GET лента по id или следующий
  @Get('feed/:id')
  async getFeed(
    @Param('id', ParseIntPipe) id: number,
    @Query('next') next: string,
  ) {
    const userId = getCurrentUserId();
    return this.developmentStagesService.getFeed(id, next === 'true', userId);
  }

  // GET одна услуга по id
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const userId = getCurrentUserId();
    return this.developmentStagesService.getFeed(id, false, userId);
  }

  // POST создание с файлами (картинка + видео)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
        fileFilter: (req, file, callback) => {
          if (file.fieldname === 'image') {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
              return callback(
                new BadRequestException('Только изображения (jpg, jpeg, png, gif, webp)'),
                false,
              );
            }
          } else if (file.fieldname === 'video') {
            if (!file.mimetype.match(/\/(mp4|webm|mov)$/)) {
              return callback(
                new BadRequestException('Только видео (mp4, webm, mov)'),
                false,
              );
            }
          }
          callback(null, true);
        },
      },
    ),
  )
  async create(
    @Body() dto: CreateDevelopmentStageDto,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const userId = getCurrentUserId();
    const image = files?.image?.[0];
    const video = files?.video?.[0];
    return this.developmentStagesService.create(dto, image, video, userId);
  }

  // PUT публикация
  @Put(':id/publish')
  async publish(@Param('id', ParseIntPipe) id: number) {
    const userId = getCurrentUserId();
    return this.developmentStagesService.publish(id, userId);
  }

  // DELETE (soft delete)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const userId = getCurrentUserId();
    await this.developmentStagesService.remove(id, userId);
    return { message: 'Услуга удалена', id };
  }

  // POST лайк
  @Post(':id/like')
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LikeDto,
  ) {
    const userId = getCurrentUserId();
    return this.developmentStagesService.like(id, dto.value, userId);
  }
}