export class Api {
    private _ws: WebSocket;

    constructor(public rootApi: string) {
    }

    public connect(sessionId: string) {
        this._ws = new WebSocket(this.rootApi + '/client/' + sessionId);

        return new Promise(resolve => {
            this._ws.addEventListener('open', () => {
                this._ws.addEventListener('message', (msg) => {
                    if (msg.data === 'start') {
                        resolve();
                    }
                });
            });
        });
    }

    public postScore(score: number) {
        this._ws.send(score);
    }
}