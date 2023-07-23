import {expect} from 'chai';
import {Application} from 'express';
import request from 'supertest';
import {App} from '../src/App';

describe('App', () => {
    let expressApp: Application;
    let app: App;

    before(async () => {
        app = new App();
        await app.start();
        expressApp = app.express;
    });

    it('should have a health-check on /status', () => {
        return request(expressApp)
            .get('/status')
            .expect(200)
            .then(res => expect(res.text).to.equal('OK\r\n'));
    });

    it('should respond with the correct card info on /card/:cardNumber', () => {
        return request(expressApp)
            .get('/card/9203111020153687')
            .expect(200)
            .then(res =>
                expect(res.text).to.equal(
                    '3.7.2020 Aktivní v držení klienta\r\n',
                ),
            );
    });
});
