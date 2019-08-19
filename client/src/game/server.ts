export class Server {
    private _clientId: string;
    private _ws?: WebSocket;

    constructor(clientId: string) {
        this._clientId = clientId;
    }

    connect() {
        this._ws = new WebSocket('/ws/' + this._clientId);

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
}