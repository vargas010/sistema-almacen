import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: 'http://localhost:3000', // Nuestro frontend
    credentials: true,
  });
  
  await app.listen(3001);
  console.log('Backend ejecutándose en http://localhost:3001');
}
bootstrap();