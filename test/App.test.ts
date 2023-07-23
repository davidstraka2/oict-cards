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

    it('should start', () => {
        expect(expressApp).not.to.be.undefined;
    });

    it('should respond with hello world on /', () => {
        return request(expressApp)
            .get('/')
            .expect(200)
            .then(res => expect(res.text).to.equal('Hello World!'));
    });
});
