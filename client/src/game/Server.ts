import { HighScore } from "./interfaces";

declare const process: any;

export class Server {
	clientId: string;
	connected: boolean = false;
	authorized: boolean = process.env.NODE_ENV === 'dev';
	packet: number = 0;
	protected socket: WebSocket;
	private callbackMap: { [key: string]: (result: any) => void } = {};

	constructor(clientId: string) {
		this.clientId = clientId;
	}

	connect() {
		this.socket = new WebSocket(`ws://${document.location.host}/ws`);
		this.socket.addEventListener("open", () => {
			this.connected = true;
			this.sendMessage("connect", { sessionId: this.clientId });
		});
		this.socket.addEventListener("close", () => {
			this.connected = false;
			this.authorized = false;
		});
		this.socket.addEventListener("message", payload => {
			const json = JSON.parse(payload.data);
			this.processMessage(json);
		});
	}

	protected processMessage(json: any) {
		switch (json.event) {
			case "play":
				this.authorized = true;
				break;
		}

		if (json.packet && this.callbackMap[json.packet]) {
			this.callbackMap[json.packet](json);
			delete this.callbackMap[json.packet];
		}
	}

	protected sendMessage(event: string, data?: any) {
		if (this.connected) {
			this.socket.send(JSON.stringify({ event, data }));
		}
	}

	postHighScore(score: number): Promise<HighScore[]> {
		return new Promise(resolve => {
			const packet = ++this.packet;
			this.callbackMap[packet] = (results: any) => {
				resolve(results.data);
			};

			this.sendMessage("high-score", {
				sessionId: this.clientId,
				score,
				packet
			});
		});
	}
}
