import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../development_stages/entities/user.entity';
import { SessionService } from './session.service';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly sessionService: SessionService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { username: dto.username } });
    if (existing) {
      // Просто отдаем 409 Conflict без текста
      throw new ConflictException();
    }

    const user = this.userRepo.create({
      username: dto.username,
      password: dto.password,
      fullName: dto.fullName,
      role: 'creator', 
    });

    await this.userRepo.save(user);

    return { id: user.id, username: user.username, fullName: user.fullName, role: user.role };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { username: dto.username } });
    
    if (!user || user.password !== dto.password) {
      // Просто 401 Unauthorized
      throw new UnauthorizedException();
    }

    const sessionId = uuidv4();
    await this.sessionService.create(sessionId, user.id);

    // Возвращаем только нужные данные (кука установится в контроллере)
    return {
      sessionId,
      user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName },
    };
  }

  async logout(sessionId: string) {
    await this.sessionService.destroy(sessionId);
  }

  async validateSession(sessionId: string) {
    const userId = await this.sessionService.getUserId(sessionId);
    if (!userId) throw new UnauthorizedException();
    
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    
    return user;
  }
}