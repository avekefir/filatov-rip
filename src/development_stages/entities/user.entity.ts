import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { DevelopmentStage } from './development_stages.entity';
import { StageLike } from './stage_like.entity';

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

  @OneToMany(() => DevelopmentStage, (stage) => stage.creator)
  createdStages: DevelopmentStage[];

  @OneToMany(() => StageLike, (like) => like.user)
  likes: StageLike[];
}