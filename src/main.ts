import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // origin: 'http://localhost:5173', // allow only requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // allow only these methods
    allowedHeaders: 'Content-Type, Accept, Authorization', // allow only these headers
    credentials: true, // allow credentials (e.g. cookies)
  });
  await app.listen(3000);
}
bootstrap();
