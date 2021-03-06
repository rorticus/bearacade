import { Body, Controller, Get, Post } from "@nestjs/common";
import { SessionService } from "./session.service";

const link = process.env.HOST;

@Controller("app")
export class AppController {
	constructor(private _sessionService: SessionService) {}

	@Get("health")
	health() {
		return {
			ok: true
		};
	}

	@Post("slash-command")
	slashCommand(@Body()
	body: {
		user_id: string;
		user_name: string;
		response_url: string;
	}) {
		const startMessages = [
			'Ready to "collect" some bears? ',
			"Start the hunt. ",
			"Can you beat the highest score? ",
			"Those bears don't stand a chance. "
		];

		const session = this._sessionService.createSession({
			userId: body.user_id,
			userName: body.user_name,
			responseUrl: body.response_url
		});

		const message =
			startMessages[Math.floor(Math.random() * startMessages.length)];

		return {
			text: `${message}<${link}/game#${session.id}|Play here`
		};
	}
}
