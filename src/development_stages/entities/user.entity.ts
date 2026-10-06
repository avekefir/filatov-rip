import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { DevelopmentStage } from './development_stages.entity';
import { StageLike } from './stage_like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 150 })
  fullName: string;

  @Exclude() // не отдаём пароль в ответах API
  @Column({ type: 'varchar', length: 200 })
  password: string;

  @Column({ type: 'varchar', length: 50, default: 'creator' })
  role: string;

  @OneToMany(() => DevelopmentStage, (stage) => stage.creator)
  createdStages: DevelopmentStage[];

  @OneToMany(() => StageLike, (like) => like.user)
  likes: StageLike[];
}