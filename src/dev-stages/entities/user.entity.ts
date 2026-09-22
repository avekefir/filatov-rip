import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { DevStage } from './dev-stage.entity';
import { StageLike } from './stage-like.entity';

@Entity('users')
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 50, default: 'creator' })
  role: string;

  @OneToMany(() => DevStage, (stage) => stage.creator)
  createdStages: DevStage[];

  @OneToMany(() => StageLike, (like) => like.user)
  likes: StageLike[];
}