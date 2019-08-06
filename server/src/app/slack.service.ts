import {Injectable} from "@nestjs/common";
import fetch from 'node-fetch';

export interface SlackMessage {
    text: string;
}

@Injectable()
export class SlackService {
    async sendMessage(responseUrl: string, message: SlackMessage) {
        await fetch(responseUrl, {
            method: 'POST',
            body: JSON.stringify(message),
            headers: {
                'Content-Type': 'application.json'
            }
        })
    }
}