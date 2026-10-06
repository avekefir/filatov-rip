import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DevelopmentStageResponseDto {
  @Expose()
  id: number;

  @Expose()
  stageName: string;

  @Expose()
  stageDescription: string;

  @Expose()
  status: 'draft' | 'published' | 'deleted';

  @Expose()
  image: string | null;

  @Expose()
  video: string | null;

  @Expose()
  costPerHour: number;

  @Expose()
  maxTeamSize: number;

  @Expose()
  likesCount: number;

  @Expose()
  isMyStage: boolean;

  @Expose()
  isLikedByMe: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  publishedAt: Date | null;
}