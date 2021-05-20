import chai from 'chai';
import request from 'supertest';

import app from '../app';
import { getUser } from '../controllers/user';

const { expect } = chai;

export default function testAuth() {
  describe('/channels', () => {
    let user: string | undefined;
    let admin: string | undefined;

    before(async() => {
      user = await getUser('user').then(user => user?.generateToken());
      admin = await getUser('admin').then(user => user?.generateToken());
    });

    describe('#PUT /channels', () => {
      it('should not create channel - not authenticated', done => {
        request(app)
          .put('/channels')
          .send({ name: 'Channel', description: 'Description' })
          .expect(401, done);
      });

      it('should not create channel - malformed auth token', done => {
        request(app)
          .put('/channels')
          .set('Authorization', 'Bearer: imnotvalid')
          .send({ name: 'Channel', description: 'Description' })
          .expect(401, done);
      });

      it('should not create channel - not authorized', done => {
        request(app)
          .put('/channels')
          .set('Authorization', `Bearer: ${user}`)
          .send({ name: 'Channel', description: 'Description' })
          .expect(403, done);
      });

      it('should not create channel - some fields are missing', done => {
        request(app)
          .put('/channels')
          .set('Authorization', `Bearer: ${admin}`)
          .send({ name: 'Channel' })
          .expect(400, done);
      });

      it('should create channel', done => {
        request(app)
          .put('/channels')
          .set('Authorization', `Bearer: ${admin}`)
          .send({ name: 'Channel', description: 'Description' })
          .expect(200, done);
      });
    });

    describe('#PUT /channels/:slug', () => {
      it('should not create notification - not authenticated', done => {
        request(app)
          .put('/channels/channel')
          .send({ name: 'Notification', description: 'Description', notify: false })
          .expect(401, done);
      });

      it('should not create notification - malformed auth token', done => {
        request(app)
          .put('/channels/channel')
          .set('Authorization', 'Bearer: imnotvalid')
          .send({ name: 'Notification', description: 'Description', notify: false })
          .expect(401, done);
      });

      it('should not create notification - not authorized', done => {
        request(app)
          .put('/channels/channel')
          .set('Authorization', `Bearer: ${user}`)
          .send({ name: 'Notification', description: 'Description', notify: false })
          .expect(403, done);
      });

      it('should not create notification - channel does not exist', done => {
        request(app)
          .put('/channels/idontexist')
          .set('Authorization', `Bearer: ${admin}`)
          .send({ name: 'Notification', description: 'Description', notify: false })
          .expect(200, done);
      });

      it('should not create notification - some fields are missing', done => {
        request(app)
          .put('/channels/channel')
          .set('Authorization', `Bearer: ${admin}`)
          .send({ name: 'Notification' })
          .expect(400, done);
      });

      it('should create notification', done => {
        request(app)
          .put('/channels/channel')
          .set('Authorization', `Bearer: ${admin}`)
          .send({ name: 'Notification', description: 'Description', notify: false })
          .expect(200, done);
      });
    });

    describe('#GET /channels', () => {
      it('should return channels summary', done => {
        request(app)
          .get('/channels')
          .expect(200)
          .then(response => {
            expect(response.body).to.have.lengthOf(1);
            expect(response.body[0]).to.have.property('name').equal('Channel');
            expect(response.body[0]).to.have.property('description').equal('Description');
            expect(response.body[0]).to.have.property('slug').equal('channel');
            expect(response.body[0]).to.have.property('notificationsCount').equal(1);
            expect(response.body[0]).to.have.property('subscriptionsCount').equal(0);
            done();
          })
          .catch(done);
      });
    });

    describe('#GET /channels/:slug', () => {
      it('should not get channel details - channel does not exist', done => {
        request(app)
          .get('/channels/idontexist')
          .expect(404, done);
      });

      it('should get channel details', done => {
        request(app)
          .get('/channels/channel')
          .expect(200)
          .then(response => {
            expect(response.body).to.have.property('name').equal('Channel');
            expect(response.body).to.have.property('description').equal('Description');
            expect(response.body).to.have.property('slug').equal('channel');
            expect(response.body).to.have.property('notifications').lengthOf(1);
            expect(response.body.notifications[0]).to.have.property('name').equal('Notification');
            expect(response.body.notifications[0]).to.have.property('description').equal('Description');
            expect(response.body.notifications[0]).to.have.property('slug').equal('notification');
            done();
          })
          .catch(done);
      });
    });

    describe('#DELETE /channels/:channelSlug/:notificationSlug', () => {
      it('should not delete notification - not authenticated', done => {
        request(app)
          .delete('/channels/channel/notification')
          .expect(401, done);
      });

      it('should not delete notification - malformed auth token', done => {
        request(app)
          .delete('/channels/channel/notification')
          .set('Authorization', 'Bearer: imnotvalid')
          .expect(401, done);
      });

      it('should not delete notification - not authorized', done => {
        request(app)
          .delete('/channels/channel/notification')
          .set('Authorization', `Bearer: ${user}`)
          .expect(403, done);
      });

      it('should not delete notification - channel does not exist', done => {
        request(app)
          .delete('/channels/idontexist/notification')
          .set('Authorization', `Bearer: ${admin}`)
          .expect(200, done);
      });

      it('should not delete notification - notification does not exist', done => {
        request(app)
          .delete('/channels/channel/idontexist')
          .set('Authorization', `Bearer: ${admin}`)
          .expect(200, done);
      });

      it('should delete notification', done => {
        request(app)
          .delete('/channels/channel/notification')
          .set('Authorization', `Bearer: ${admin}`)
          .expect(200, done);
      });
    });

    describe('#DELETE /channels/:channelSlug', () => {
      it('should not delete channel - not authenticated', done => {
        request(app)
          .delete('/channels/channel')
          .expect(401, done);
      });

      it('should not delete channel - malformed auth token', done => {
        request(app)
          .delete('/channels/channel')
          .set('Authorization', 'Bearer: imnotvalid')
          .expect(401, done);
      });

      it('should not delete channel - not authorized', done => {
        request(app)
          .delete('/channels/channel')
          .set('Authorization', `Bearer: ${user}`)
          .expect(403, done);
      });

      it('should not delete channel - channel does not exist', done => {
        request(app)
          .delete('/channels/idontexist')
          .set('Authorization', `Bearer: ${admin}`)
          .expect(200, done);
      });

      it('should delete channel', done => {
        request(app)
          .delete('/channels/channel')
          .set('Authorization', `Bearer: ${admin}`)
          .expect(200, done);
      });
    });
  });
}