import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { StageLike } from './stage_like.entity';

@Entity('development_stages')
export class DevelopmentStage {
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

  // Поля по теме
  @Column({ type: 'int', default: 0 })
  costPerHour: number;         // стоимость за час (₽/ч)

  @Column({ type: 'int', default: 1 })
  maxTeamSize: number;         // максимальный размер команды (чел)

  // Системные поля
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