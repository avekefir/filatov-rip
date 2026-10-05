import { Injectable } from '@nestjs/common';

export interface DevelopmentStage {
  id: number;
  stageName: string;          // название этапа
  stageDescription: string;   // краткое описание
  costPerHour: number;        // стоимость за час (₽/ч)
  maxTeamSize: number;        // максимальный размер команды (чел)
  status: 'draft' | 'published' | 'deleted';
  image: string;              // имя файла в MinIO
  video: string;              // имя файла в MinIO
  likes: number[];            // массив ID пользователей
}

@Injectable()
export class DevelopmentStagesService {
  private stages: DevelopmentStage[] = [
    {
      id: 1,
      stageName: 'Проектирование',
      stageDescription: 'Разработка архитектуры ПО и технического задания',
      costPerHour: 1500,
      maxTeamSize: 3,
      status: 'published',
      image: 'design.jpg',
      video: 'design.mp4',
      likes: [101, 102, 103],
    },
    {
      id: 2,
      stageName: 'Кодирование',
      stageDescription: 'Написание исходного кода по спринтам',
      costPerHour: 2000,
      maxTeamSize: 5,
      status: 'published',
      image: 'coding.jpg',
      video: 'coding.mp4',
      likes: [101, 104],
    },
    {
      id: 3,
      stageName: 'Тестирование',
      stageDescription: 'Ручное и автоматизированное тестирование модулей',
      costPerHour: 1200,
      maxTeamSize: 3,
      status: 'published',
      image: 'testing.jpg',
      video: 'testing.mp4',
      likes: [102, 105],
    },
    {
      id: 4,
      stageName: 'Внедрение',
      stageDescription: 'Развертывание и сопровождение',
      costPerHour: 1800,
      maxTeamSize: 2,
      status: 'deleted',        // не отображается
      image: 'deploy.jpg',
      video: 'deploy.mp4',
      likes: [],
    },
    {
      id: 5,
      stageName: 'Черновик этапа',
      stageDescription: 'Заполните описание нового этапа',
      costPerHour: 1000,
      maxTeamSize: 2,
      status: 'draft',          // единственный черновик
      image: 'draft.jpg',
      video: 'draft.mp4',
      likes: [],
    },
  ];

  getPublished(): DevelopmentStage[] {
    return this.stages.filter((s) => s.status === 'published');
  }

  getDraft(): DevelopmentStage | undefined {
    return this.stages.find((s) => s.status === 'draft');
  }

  getById(id: number): DevelopmentStage | undefined {
    return this.stages.find((s) => s.id === id);
  }

  getNextAfter(id: number): DevelopmentStage | undefined {
    const published = this.getPublished();
    if (published.length === 0) return undefined;
    const index = published.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    if (index === published.length - 1) return published[0]; // цикл
    return published[index + 1];
  }

  // Фильтрация по максимальной стоимости за час (один слайдер)
  filterByMaxCostPerHour(maxCostPerHour: number): DevelopmentStage[] {
    const published = this.getPublished();
    if (isNaN(maxCostPerHour)) return published;
    return published.filter((s) => s.costPerHour <= maxCostPerHour);
  }
}