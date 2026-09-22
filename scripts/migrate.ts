import { DataSource } from 'typeorm';
import { User } from '../src/dev-stages/entities/user.entity';
import { DevStage } from '../src/dev-stages/entities/dev-stage.entity';
import { StageLike } from '../src/dev-stages/entities/stage-like.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, DevStage, StageLike],
  synchronize: true,
});

async function run() {
  await dataSource.initialize();
  await dataSource.synchronize();
  console.log('✅ Таблицы созданы: users, dev_stages, stage_likes');
  await dataSource.destroy();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Ошибка миграции:', err);
  process.exit(1);
});