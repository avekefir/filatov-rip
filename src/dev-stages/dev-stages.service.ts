import { Injectable } from '@nestjs/common';

export interface DevStage {
  id: number;
  stageName: string;          // название этапа
  stageDescription: string;   // краткое описание
  laborIntensity: number;     // трудоёмкость (часы)
  hourlyRate: number;         // ставка разработчика (₽/час)
  stageCost: number;          // стоимость этапа (₽)
  teamSize: number;           // размер команды (чел)
  durationDays: number;       // длительность (дни)
  status: 'draft' | 'published' | 'deleted';
  image: string;              // имя файла в MinIO
  video: string;              // имя файла в MinIO
  likes: number[];            // массив ID пользователей
}

@Injectable()
export class DevStagesService {
  private stages: DevStage[] = [
    {
      id: 1,
      stageName: 'Проектирование',
      stageDescription: 'Разработка архитектуры ПО и технического задания',
      laborIntensity: 40,
      hourlyRate: 1500,
      stageCost: 60000,
      teamSize: 2,
      durationDays: 10,
      status: 'published',
      image: 'design.jpg',
      video: 'design.mp4',
      likes: [101, 102, 103],
    },
    {
      id: 2,
      stageName: 'Кодирование',
      stageDescription: 'Написание исходного кода по спринтам',
      laborIntensity: 120,
      hourlyRate: 2000,
      stageCost: 240000,
      teamSize: 4,
      durationDays: 30,
      status: 'published',
      image: 'coding.jpg',
      video: 'coding.mp4',
      likes: [101, 104],
    },
    {
      id: 3,
      stageName: 'Тестирование',
      stageDescription: 'Ручное и автоматизированное тестирование модулей',
      laborIntensity: 60,
      hourlyRate: 1200,
      stageCost: 72000,
      teamSize: 2,
      durationDays: 15,
      status: 'published',
      image: 'testing.jpg',
      video: 'testing.mp4',
      likes: [102, 105],
    },
    {
      id: 4,
      stageName: 'Внедрение',
      stageDescription: 'Развертывание и сопровождение',
      laborIntensity: 30,
      hourlyRate: 1800,
      stageCost: 54000,
      teamSize: 1,
      durationDays: 7,
      status: 'deleted',        // не отображается
      image: 'deploy.jpg',
      video: 'deploy.mp4',
      likes: [],
    },
    {
      id: 5,
      stageName: 'Черновик этапа',
      stageDescription: 'Заполните описание нового этапа',
      laborIntensity: 0,
      hourlyRate: 1000,
      stageCost: 0,
      teamSize: 1,
      durationDays: 0,
      status: 'draft',          // единственный черновик
      image: 'draft.jpg',
      video: 'draft.mp4',
      likes: [],
    },
  ];

  getPublished(): DevStage[] {
    return this.stages.filter(s => s.status === 'published');
  }

  getDraft(): DevStage | undefined {
    return this.stages.find(s => s.status === 'draft');
  }

  getById(id: number): DevStage | undefined {
    return this.stages.find(s => s.id === id);
  }

  getNextAfter(id: number): DevStage | undefined {
    const published = this.getPublished();
    if (published.length === 0) return undefined;
    const index = published.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    if (index === published.length - 1) return published[0]; // цикл
    return published[index + 1];
  }

  filterByCostRange(minCost: number, maxCost: number): DevStage[] {
    const published = this.getPublished();
    if (isNaN(minCost) && isNaN(maxCost)) return published;
    return published.filter(s => {
      if (!isNaN(minCost) && s.stageCost < minCost) return false;
      if (!isNaN(maxCost) && s.stageCost > maxCost) return false;
      return true;
    });
  }
}