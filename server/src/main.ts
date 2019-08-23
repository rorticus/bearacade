import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { resolve } from 'path';
import * as express from 'express';
import {WsAdapter} from "@nestjs/platform-ws";

const gamePath = process.env.STATIC_PATH || resolve(__dirname, '../../client/build');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use('/game', express.static(gamePath));
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.listen(8000);
}
bootstrap();