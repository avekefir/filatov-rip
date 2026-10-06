import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { TypeOrmUsersRepository } from './repositories/typeorm-users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: TypeOrmUsersRepository) {}

  // Регистрация (заглушка — пароль хранится в открытом виде, в Lab 4 заменим на хеш)
  async register(data: {
    username: string;
    password: string;
    fullName: string;
  }) {
    const existing = await this.usersRepo.findByUsername(data.username);
    if (existing) {
      throw new ConflictException('Пользователь с таким логином уже существует');
    }

    const user = await this.usersRepo.create({
      username: data.username,
      password: data.password, // TODO: в Lab 4 — bcrypt
      fullName: data.fullName,
      role: 'creator',
    });

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
  }

  // Логин (заглушка — возвращает данные пользователя, в Lab 4 — сессия/JWT)
  async login(data: { username: string; password: string }) {
    const user = await this.usersRepo.findByUsername(data.username);
    if (!user || user.password !== data.password) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return {
      message: 'Аутентификация успешна (заглушка для Lab 4)',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  // Деавторизация (заглушка)
  async logout() {
    return {
      message: 'Деавторизация (заглушка для Lab 4)',
    };
  }
}