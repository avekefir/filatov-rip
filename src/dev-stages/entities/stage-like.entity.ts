import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { DevStage } from './dev-stage.entity';

@Entity('stage_likes')
export class StageLike {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  stageId: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => DevStage, (stage) => stage.likes, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'stageId' })
  stage: DevStage;
}