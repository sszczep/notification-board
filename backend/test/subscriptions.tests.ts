import chai from 'chai';
import request from 'supertest';

import app from '../app';
import { createChannel } from '../controllers/channel';

const { expect } = chai;

export default function testAuth() {
  describe('/subscriptions', () => {
    before(async() => {
      // Create channel
      await createChannel('Channel', 'Description');
    });

    describe('#PUT /subscriptions/channels/:slug', () => {
      it('should not create subscription - some fields are missing', done => {
        request(app)
          .put('/subscriptions/channels/channel')
          .send({ endpoint: 'https://domain.com', keys: { p256dh: 'p256dh' } })
          .expect(400, done);
      });

      it('should not create subscription - some fields are invalid', done => {
        request(app)
          .put('/subscriptions/channels/channel')
          .send({ endpoint: 'invalidurl', keys: { p256dh: 'p256dh', auth: 'auth' } })
          .expect(400, done);
      });

      it('should not create subscription - channel does not exist', done => {
        request(app)
          .put('/subscriptions/channels/idontexist')
          .send({ endpoint: 'https://domain.com', keys: { p256dh: 'p256dh', auth: 'auth' } })
          .expect(200, done);
      });

      it('should create subscription', done => {
        request(app)
          .put('/subscriptions/channels/channel')
          .send({ endpoint: 'https://domain.com', keys: { p256dh: 'p256dh', auth: 'auth' } })
          .expect(200, done);
      });
    });

    describe('#GET /subscriptions/channels?endpoint=<endpoint>', () => {
      it('should get subscribed channels', done => {
        request(app)
          .get('/subscriptions/channels?endpoint=https://domain.com')
          .expect(200)
          .then(response => {
            expect(response.body).to.have.lengthOf(1);
            expect(response.body).to.contain('channel');
            done();
          })
          .catch(done);
      });
    });

    describe('#DELETE /subscriptions/channels/:slug', () => {
      it('should not remove subscription - some fields are missing', done => {
        request(app)
          .delete('/subscriptions/channels/channel')
          .send({})
          .expect(400, done);
      });

      it('should not remove subscription - some fields are invalid', done => {
        request(app)
          .delete('/subscriptions/channels/channel')
          .send({ endpoint: 'invalidurl' })
          .expect(400, done);
      });

      it('should not remove subscription - channel does not exist', done => {
        request(app)
          .delete('/subscriptions/channels/idontexist')
          .send({ endpoint: 'https://domain.com' })
          .expect(200, done);
      });

      it('should remove subscription', done => {
        request(app)
          .delete('/subscriptions/channels/channel')
          .send({ endpoint: 'https://domain.com' })
          .expect(200, done);
      });
    });
  });
}