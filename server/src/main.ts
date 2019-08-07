import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { resolve } from 'path';
import * as express from 'express';

const gamePath = process.env.STATIC_PATH || resolve(__dirname, '../../client/build');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use('/game', express.static(gamePath));
    await app.listen(8000);
}
bootstrap();