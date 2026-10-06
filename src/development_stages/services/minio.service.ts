import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomBytes } from 'crypto';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET')!;

    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
      port: this.configService.get<number>('MINIO_PORT')!,
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,
    });

    this.ensureBucket();
  }

  // Проверяем, что бакет существует (при старте приложения)
  private async ensureBucket(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Бакет "${this.bucketName}" создан`);
      } else {
        this.logger.log(`Бакет "${this.bucketName}" уже существует`);
      }
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Ошибка инициализации бакета: ${msg}`);
    }
  }

  // Генерируем имя файла на латинице (uuid + timestamp)
  private generateFileName(prefix: string, extension: string): string {
    const unique = randomBytes(8).toString('hex');
    return `${prefix}-${Date.now()}-${unique}${extension}`;
  }

  // Загрузка файла в MinIO. Возвращает имя файла (ключ), которое сохраняем в БД.
  async uploadFile(
    file: Express.Multer.File,
    prefix: 'image' | 'video',
  ): Promise<string> {
    if (!file) {
      throw new Error('Файл не передан');
    }

    const extension = this.getExtension(file.originalname);
    const fileName = this.generateFileName(prefix, extension);

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return fileName;
  }

  // Удаление файла из MinIO
  async deleteFile(fileName: string): Promise<void> {
    if (!fileName) return;
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Не удалось удалить файл ${fileName}: ${msg}`);
    }
  }

  // Получить публичный URL файла (бакет должен быть public)
  getFileUrl(fileName: string | null): string | null {
    if (!fileName) return null;
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = this.configService.get<number>('MINIO_PORT');
    const protocol =
      this.configService.get<string>('MINIO_USE_SSL') === 'true'
        ? 'https'
        : 'http';
    return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`;
  }

  // Извлекаем расширение из имени файла
  private getExtension(originalName: string): string {
    const dotIndex = originalName.lastIndexOf('.');
    if (dotIndex === -1) return '.bin';
    return originalName.slice(dotIndex).toLowerCase();
  }
}