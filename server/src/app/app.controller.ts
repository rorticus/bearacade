import { Controller, Get, Post } from "@nestjs/common";
import { SessionService } from "./session.service";

@Controller("app")
export class AppController {
	constructor(private _sessionService: SessionService) {}

	@Get("health")
	health() {
		return {
			ok: true
		};
	}
}
