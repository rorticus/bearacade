import {Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {DatabaseService} from "./database.service";
import {ApiController} from "./api.controller";
import {SlackService} from "./slack.service";

@Module({
    controllers: [AppController, ApiController],
    providers: [DatabaseService, SlackService],
    exports: []
})
export class AppModule {}