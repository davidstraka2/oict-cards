import express, {NextFunction, Request, Response} from 'express';
import {Server} from 'node:http';
import swaggerUi from 'swagger-ui-express';

/** A simple Express server that fetches payment card data from a remote API */
export class App {
    // [CR] eměly by to být privátní proměnné
    // [CR] hodilo by se mít v nějakým configu odděleně
    host = process.env.APP_HOST ?? 'localhost';
    port = parseInt(process.env.APP_PORT ?? '3000', 10);
    // [CR] proč funkce?
    cardValidityEndpoint = (cardNumber: string) =>
        `http://private-264465-litackaapi.apiary-mock.com/cards/${cardNumber}/validity`;
    cardStateEndpoint = (cardNumber: string) =>
        `http://private-264465-litackaapi.apiary-mock.com/cards/${cardNumber}/state`;
    validAPIKeys = ['test'];
    docsPath = '../docs/openapi.json';
    express = express();
    server?: Server;

    constructor() {
        this.setupMiddleware();
        this.setupRoutes();
    }

    /** Start the Express server */
    async start(): Promise<void> {
        // [CR] neni odchycena chyba pokud se server nepodaří spustit
        return new Promise<void>(resolve => {
            this.server = this.express.listen(this.port, this.host, () => {
                console.log(
                    `Express server is listening on http://${this.host}:${this.port}.`,
                );
                resolve();
            });
        });
    }

    /** Set up middleware for the Express server */
    private setupMiddleware(): void {
        // Log requests to the console
        // [CR] mělo by to být v middleware
        // [CR] možná lepší použít nějaký logger, např. winston, pino
        this.express.use((req: Request, res: Response, next: NextFunction) => {
            this.log(req);
            next();
        });
        // Check for valid API keys where needed
        // [CR] mělo by to být v middleware, šlo by to pak použít pro více než jednu routu
        this.express.use(
            '/card/:cardNumber',
            (req: Request, res: Response, next: NextFunction) => {
                const token = req.header('X-Access-Token') ?? '';
                if (!this.validAPIKeys.includes(token)) {
                    console.log(`Unauthorized request with token "${token}".`);
                    // [CR] 403 neznamená Unauthorized, ale Forbidden
                    // [CR] kdy použít 403 a kdy 401?
                    res.status(403).send('Unauthorized\r\n');
                    return;
                }
                next();
            },
        );
        // Serve the OpenAPI documentation on /docs/openapi
        this.express.use(
            '/docs/openapi',
            swaggerUi.serve,
            swaggerUi.setup(require(this.docsPath)),
        );
    }

    /** Set up the routes for the Express server */
    private setupRoutes(): void {
        // Health-check endpoint
        this.express.get('/status', (req: Request, res: Response) =>
            res.send('OK\r\n'),
        );
        // Card info endpoint
        this.express.get(
            '/card/:cardNumber',
            async (req: Request, res: Response) => {
                const cardNumber = req.params.cardNumber;
                // [CR] co když je zdroj nedostupný? (neochycená chyba)
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
        // [CR] vrátí api vždy json v daném formátu?
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
        // [CR] vrátí api vždy json v daném formátu?
        const data = await res.json();
        return data.state_description;
    }
}
