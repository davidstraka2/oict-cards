import express, {Request, Response} from 'express';

const app = express();
const port = parseInt(process.env.APP_PORT ?? '3000', 10);
const host = process.env.APP_HOST ?? 'localhost';

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.listen(port, host, () => {
    console.log(`Example app listening on port ${port}`);
});
