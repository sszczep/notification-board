import * as ApiErrors from './utils/apiErrors';

import {
  Box,
  Button,
  Card,
  Columns,
  Container,
  Form,
  Heading,
  Hero,
  Level,
  Modal,
  Progress,
} from 'react-bulma-components';
import { getSubscribedChannels, subscribe, supportsNotifications, unsubscribe } from './controllers/notifications';
import { useCallback, useContext, useEffect, useState } from 'react';

import { AlertsContext } from './contexts/alerts';
import { AuthContext } from './contexts/auth';
import { Link } from "react-router-dom";
import { addChannel } from './controllers/channels';
import axios from 'axios';
import { isAdmin } from './controllers/auth';

interface IChannelDTO {
  slug: string;
  name: string;
  description: string;
  notificationsCount: number;
  subscriptionsCount: number;
};

interface IChannel extends IChannelDTO {
  subscribed: boolean;
};

function Statistics({ channelsCount, notificationsCount, subscriptionsCount }: { channelsCount: number, notificationsCount: number, subscriptionsCount: number }) {
  return (
    <Box marginless>
      <Level>
        <Level.Item>
          <Heading size={5} subtitle>
            <strong>{channelsCount}</strong> channels
          </Heading>
        </Level.Item>
        <Level.Item>
          <Heading size={5} subtitle>
            <strong>{notificationsCount}</strong> notifications
          </Heading>
        </Level.Item>
        <Level.Item>
          <Heading size={5} subtitle>
            <strong>{subscriptionsCount}</strong> subscriptions
          </Heading>
        </Level.Item>
      </Level>
    </Box>
  );
}

function SubscribeButton(
  { slug, subscribed, setSubscribed }: { slug: string, subscribed: boolean, setSubscribed: (value: boolean) => void }
) {
  const { pushMessage } = useContext(AlertsContext);
  
  const onButtonClick = async(event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    try {
      if(subscribed) {
        await unsubscribe(slug);

        pushMessage({ body: 'Successfully unsubscribed from channel', color: 'success', timeout: 5000 });
      } else {
        await subscribe(slug);

        pushMessage({ body: 'Successfully subscribed to channel', color: 'success', timeout: 5000 });
      }

      setSubscribed(!subscribed);
    } catch(err) {
      if(axios.isAxiosError(err)) {
        if(err.response) {
          pushMessage({ body: err.response.data.error.message, color: 'danger' });
        } else {
          pushMessage({ body: 'Error when sending request to the server. If the error is persistent, please contact website administrator', color: 'danger' });
        }
      } else {
        pushMessage({ body: err.message, color: 'danger' });
      }
    }
  };

  return (
    <Button 
      size="small" 
      inverted 
      color={ subscribed ? "danger" : "success" } 
      mobile={{ display: 'hidden' }}
      ml={3}
      onClick={onButtonClick}
    >
      { subscribed ? "Unsubscribe" : "Subscribe" }
    </Button>
  );
}

function Channel({ channel, setSubscribed }: { channel: IChannel, setSubscribed: (value: boolean) => void }) {
  return (
    <Link to={`/channel/${channel.slug}`}>
      <Card shadowless>
        <Card.Content>
          <Container>
            <Columns vCentered>
              <Columns.Column>
                <Heading size={4}>
                  {channel.name}
                  { supportsNotifications() && 
                    <SubscribeButton slug={channel.slug} subscribed={channel.subscribed} setSubscribed={setSubscribed} />
                  }
                </Heading>
                <Heading size={6} subtitle>{channel.description}</Heading>
              </Columns.Column>
              <Columns.Column narrow flexDirection="column">
                <span style={{ display: 'flex' }}>{channel.notificationsCount} notifications</span>
                <span style={{ display: 'flex' }}>{channel.subscriptionsCount} subscriptions</span>
              </Columns.Column>
            </Columns>
          </Container>
        </Card.Content>
      </Card>
    </Link>
  );
}

function CreateChannel({ fetchChannels }: { fetchChannels: () => void }) {
  const { pushMessage } = useContext(AlertsContext);

  const [modalOpened, setModalOpened] = useState(false);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [formError, setFormError] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear all errors
    setNameError('');
    setDescriptionError('');
    setFormError('');

    addChannel(name, description)
      .then(() => {
        pushMessage({ body: 'Successfully created new channel', color: 'success', timeout: 5000 });
        setModalOpened(false);
        fetchChannels();
      }).catch((err) => {
        if(err.response) {
          // Check for username and password errors
          if(err.response.data.error.name === 'HttpValidationError') {
            const { validationErrors } = err.response.data.error as ApiErrors.HttpValidationError;
            validationErrors.forEach(validationError => {
              if(validationError.param === 'name') setNameError(validationError.msg);
              else if(validationError.param === 'description') setDescriptionError(validationError.msg);
            });
          // Other errors should be displayed as form errors
          } else {
            setFormError(err.response.data.error.message);
          }
        // If we did not get response, either the server is down or the request could not be sent
        } else {
          setFormError('Error when sending request to the server. If the error is persistent, please contact website administrator');
        }
      });
  };

  return (
    <>
      <Button color="link" fullwidth style={{ borderRadius: 0 }} onClick={() => setModalOpened(true)}>Create new channel</Button>

      <Modal show={modalOpened} onClose={() => setModalOpened(false)}>
        <Modal.Card>
          <Modal.Card.Header showClose>
            <Modal.Card.Title>Create new channel</Modal.Card.Title>
          </Modal.Card.Header>

          <Modal.Card.Body>
            <form onSubmit={onSubmit}>
              <Form.Field>
                <Form.Control>
                  <Form.Input 
                    placeholder="Channel name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </Form.Control>
                { nameError && <Form.Help color="danger">{ nameError }</Form.Help>}
              </Form.Field>

              <Form.Field>
                <Form.Control>
                  <Form.Input 
                    placeholder="Channel description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </Form.Control>
                { descriptionError && <Form.Help color="danger">{ descriptionError }</Form.Help>}
              </Form.Field>

              <Form.Field>
                <Form.Control>
                  <Button color="link" fullwidth>Create channel</Button>
                </Form.Control>
                { formError && <Form.Help color="danger">{ formError }</Form.Help>}
              </Form.Field>
            </form>
          </Modal.Card.Body>
        </Modal.Card>
      </Modal>
    </>
  );
};

export default function Main() {
  const { token } = useContext(AuthContext);
  const { pushMessage } = useContext(AlertsContext);

  const [channels, setChannels] = useState<IChannel[] | null>(null);

  const fetchChannels = useCallback(() => {
    Promise.all([
      axios.get<IChannelDTO[]>('/channels'), 
      getSubscribedChannels(),
    ]).then(([ response, subscribedChannels]) => {
      setChannels(response.data.map(channel => ({ ...channel, subscribed: subscribedChannels.includes(channel.slug) })));
    }).catch(err => {
      if(axios.isAxiosError(err)) {
        if(err.response) {
          pushMessage({ body: err.response.data.error.message, color: 'danger' });
        } else {
          pushMessage({ body: 'Error when sending request to the server. If the error is persistent, please contact website administrator', color: 'danger' });
        }
      } else {
        pushMessage({ body: err.message, color: 'danger' });
      }
    });
  }, [pushMessage]);

  useEffect(() => { fetchChannels() }, [fetchChannels]);

  const setSubscribed = (slug: string) => (value: boolean) => {
    // Just refresh channels data
    // We would also need to update counters, etc.
    fetchChannels();

    // if(channels) {
    //   const channelIndex = channels.findIndex(channel => channel.slug === slug);
    //   if(channelIndex !== -1) {
    //     const channel = { ...channels[channelIndex], subscribed: value };
    //     setChannels([
    //       ...channels.slice(0, channelIndex),
    //       channel,
    //       ...channels.slice(channelIndex + 1),
    //     ]);
    //   }
    // }
  };

  return (
    <>
      <Hero color="info" size="medium">
        <Hero.Body>
          <Container>
            <Columns vCentered>
              <Columns.Column narrow mobile={{ display: 'hidden' }}>
                <i className="fas fa-2x fa-bell"></i>
              </Columns.Column>
              <Columns.Column>
                <Heading>
                  Notification board for your neighbourhood
                </Heading>
                <Heading subtitle>
                  Because being late does never feel good.
                </Heading>
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>

      { channels ? (
        <>
          <Statistics
            channelsCount={channels.length}
            notificationsCount={channels.reduce((count, channel) => count += channel.notificationsCount, 0)}
            subscriptionsCount={channels.reduce((count, channel) => count += channel.subscriptionsCount, 0)}
          />

          { channels.map(channel => <Channel channel={channel} key={channel.slug} setSubscribed={setSubscribed(channel.slug)} />)}

          { token && isAdmin(token) && <CreateChannel fetchChannels={fetchChannels} />}
        </>
      ) : (
        <Progress 
          marginless 
          radiusless 
          color="info"
          size="small"
        />
      )}
    </>
  );
}