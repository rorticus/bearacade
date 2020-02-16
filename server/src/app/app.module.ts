import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { DatabaseService } from "./database.service";
import { ApiController } from "./api.controller";
import { SlackService } from "./slack.service";
import { SessionService } from "./session.service";
import { ClientGateway } from "./client.gateway";
import {SlackController} from "./slack.controller";

@Module({
	controllers: [AppController, ApiController, SlackController],
	providers: [DatabaseService, SessionService, SlackService, ClientGateway],
	exports: []
})
export class AppModule {}
