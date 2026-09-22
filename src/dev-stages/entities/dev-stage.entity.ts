import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { StageLike } from './stage-like.entity';

@Entity('dev_stages')
export class DevStage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  stageName: string;

  @Column({ type: 'text' })
  stageDescription: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'deleted';

  @Column({ type: 'varchar', length: 200, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  video: string;

  @Column({ type: 'int', default: 0 })
  laborIntensity: number;

  @Column({ type: 'int', default: 0 })
  hourlyRate: number;

  @Column({ type: 'int', default: 0 })
  stageCost: number;

  @Column({ type: 'int', default: 1 })
  teamSize: number;

  @Column({ type: 'int', default: 0 })
  durationDays: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @ManyToOne(() => User, (user) => user.createdStages, { nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId: number;

  @OneToMany(() => StageLike, (like) => like.stage)
  likes: StageLike[];
}