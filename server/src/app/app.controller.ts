import {Controller, Get} from "@nestjs/common";

@Controller('app')
export class AppController {
    @Get('health')
    health() {
        return {
            ok: true
        };
    }
}