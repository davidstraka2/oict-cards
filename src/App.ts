import express, {Request, Response} from 'express';
import {Server} from 'node:http';

export class App {
    host = process.env.APP_HOST ?? 'localhost';
    port = parseInt(process.env.APP_PORT ?? '3000', 10);
    express = express();
    server?: Server;

    constructor() {
        this.setupRoutes();
    }

    async start() {
        return new Promise<void>(resolve => {
            this.server = this.express.listen(this.port, this.host, () => {
                console.log(
                    `Express server is listening on http://${this.host}:${this.port}`,
                );
                resolve();
            });
        });
    }

    private setupRoutes() {
        this.express.get('/', (req: Request, res: Response) => {
            res.send('Hello World!');
        });
    }
}
