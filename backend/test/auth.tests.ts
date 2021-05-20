import chai from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../app';
import config from '../config';

const { expect } = chai;

function pokemonize(value: string) {
  return value.split('')
    .map((char, index) => (index % 2 ? char : char.toUpperCase()))
    .join('');
}

export default function testAuth() {
  describe('/auth', () => {
    describe('#POST /auth/sign-up', () => {
      it('should not register - some fields are missing', done => {
        request(app)
          .post('/auth/sign-up')
          .send({ username: 'user' })
          .expect(400, done);
      });

      it('should not register - username in use', done => {
        request(app)
          .post('/auth/sign-up')
          .send({ username: 'admin', password: 'admin' })
          .expect(409, done);
      });

      it('should register', done => {
        request(app)
          .post('/auth/sign-up')
          .send({ username: 'user', password: 'user' })
          .expect(200)
          .then(response => {
            const token = jwt.verify(response.text, config.jwtSecret);
            expect(token).to.have.property('username').equal('user');
            done();
          })
          .catch(done);
      });
    });
  
    describe('#POST /auth/sign-in', () => {
      it('should not login - some fields are missing', done => {
        request(app)
          .post('/auth/sign-in')
          .send({ username: 'user' })
          .expect(400, done);
      });

      it('should not login - invalid credentials', done => {
        request(app)
          .post('/auth/sign-in')
          .send({ username: 'user', password: 'admin' })
          .expect(400, done);
      });

      it('should login', done => {
        request(app)
          .post('/auth/sign-in')
          .send({ username: 'user', password: 'user' })
          .expect(200)
          .then(response => {
            const token = jwt.verify(response.text, config.jwtSecret);
            expect(token).to.have.property('username').equal('user');
            done();
          })
          .catch(done);
      });

      it('should login with some letters capitalized', done => {
        request(app)
          .post('/auth/sign-in')
          .send({ username: pokemonize('user'), password: 'user' })
          .expect(200)
          .then(response => {
            const token = jwt.verify(response.text, config.jwtSecret);
            expect(token).to.have.property('username').equal('user');
            done();
          })
          .catch(done);
      });
    });
  });
}