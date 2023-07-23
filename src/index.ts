import express, {Request, Response} from 'express';

const app = express();
const port = 3000;
const host = '0.0.0.0';

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.listen(port, host, () => {
    console.log(`Example app listening on port ${port}`);
});
