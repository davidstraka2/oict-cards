import express, {Request, Response} from 'express';
import {Server} from 'node:http';

/** A simple Express server that fetches payment card data from a remote API */
export class App {
    host = process.env.APP_HOST ?? 'localhost';
    port = parseInt(process.env.APP_PORT ?? '3000', 10);
    cardValidityEndpoint = (cardNumber: string) =>
        `http://private-264465-litackaapi.apiary-mock.com/cards/${cardNumber}/validity`;
    cardStateEndpoint = (cardNumber: string) =>
        `http://private-264465-litackaapi.apiary-mock.com/cards/${cardNumber}/state`;
    express = express();
    server?: Server;

    constructor() {
        this.setupRoutes();
    }

    /** Start the Express server */
    async start(): Promise<void> {
        return new Promise<void>(resolve => {
            this.server = this.express.listen(this.port, this.host, () => {
                console.log(
                    `Express server is listening on http://${this.host}:${this.port}.`,
                );
                resolve();
            });
        });
    }

    /** Set up the routes for the Express server */
    private setupRoutes(): void {
        this.express.get('/status', (req: Request, res: Response) => {
            this.log(req);
            res.send('OK\r\n');
        });
        this.express.get(
            '/card/:cardNumber',
            async (req: Request, res: Response) => {
                const cardNumber = req.params.cardNumber;
                this.log(req);
                const cardValidityEndPromise =
                    this.fetchCardValidityEnd(cardNumber);
                const cardStatePromise = this.fetchCardState(cardNumber);
                const [cardValidityEnd, cardState] = await Promise.all([
                    cardValidityEndPromise,
                    cardStatePromise,
                ]);
                const cardInfo = `${cardValidityEnd} ${cardState}\r\n`;
                res.send(cardInfo);
            },
        );
    }

    /**
     * Log a given request to the console with a timestamp of the current time
     *
     * @param req The request to log
     */
    private log(req: Request) {
        console.log(`[${Date.now()}] Received a ${req.path} request.`);
    }

    /**
     * Fetch the validity end date of a given card from the remote API
     *
     * @param cardNumber The number of the card to fetch the validity of
     * @returns The card validity end date in the format "D.M.YYYY"
     */
    private async fetchCardValidityEnd(cardNumber: string): Promise<string> {
        const res = await fetch(this.cardValidityEndpoint(cardNumber));
        const data = await res.json();
        const validityEnd = new Date(data.validity_end);
        return `${validityEnd.getDay()}.${validityEnd.getMonth()}.${validityEnd.getFullYear()}`;
    }

    /**
     * Fetch the state of a given card from the remote API
     *
     * @param cardNumber The number of the card to fetch the state of
     * @returns A textual description of the card's state
     */
    private async fetchCardState(cardNumber: string): Promise<string> {
        const res = await fetch(this.cardStateEndpoint(cardNumber));
        const data = await res.json();
        return data.state_description;
    }
}
