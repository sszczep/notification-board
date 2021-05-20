import * as ApiErrors from './utils/apiErrors';

import {
  Button,
  Card,
  Columns,
  Container,
  Form,
  Heading,
  Hero,
  Modal,
  Progress,
  Section
} from 'react-bulma-components';
import { addNotification, removeChannel, removeNotification } from './controllers/channels';
import { getSubscribedChannels, subscribe, supportsNotifications, unsubscribe } from './controllers/notifications';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from "react-router-dom";

import { AlertsContext } from './contexts/alerts';
import { AuthContext } from './contexts/auth';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { isAdmin } from './controllers/auth';

interface INotificationDTO {
  slug: string;
  name: string;
  description: string;
  date: Date;
};

interface IChannelDTO {
  slug: string;
  name: string;
  description: string;
  notifications: INotificationDTO[];
};

interface IChannel extends IChannelDTO {
  subscribed: boolean;
};

interface IParams {
  slug: string;
};

function SubscribeButton(
  { slug, subscribed, setSubscribed }: { slug: string, subscribed: boolean, setSubscribed: (value: boolean) => void }
) {
  const { pushMessage } = useContext(AlertsContext);

  const onButtonClick = async () => {
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
    <Button m={1} color={ subscribed ? "danger" : "success" } onClick={onButtonClick}>
      <i className="fas fa-bell"></i>
      <span style={{ marginLeft: 5 }}>{ subscribed ? "Unsubscribe" : "Subscribe" }</span>
    </Button>
  );
}

function RemoveChannelButton({ slug }: { slug: string }) {
  const { pushMessage } = useContext(AlertsContext);

  const history = useHistory();

  const onButtonClick = async () => {
    try {
      await removeChannel(slug);
      history.push("/");
      pushMessage({ body: 'Successfully removed channel', color: 'success', timeout: 5000 });
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
    <Button m={1} color="danger" onClick={onButtonClick}>
      <i className="fas fa-trash"></i>
      <span style={{ marginLeft: 5 }}>Remove channel</span>
    </Button>
  );
}

function RemoveNotificationButton({ channelSlug, notificationSlug, fetchChannel }: { channelSlug: string, notificationSlug: string, fetchChannel: () => void }) {
  const { pushMessage } = useContext(AlertsContext);

  const onButtonClick = async () => {
    try {
      await removeNotification(channelSlug, notificationSlug);
      pushMessage({ body: 'Successfully removed notification', color: 'success', timeout: 5000 });
      fetchChannel();
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
    <Button ml={5} size="small" color="danger" onClick={onButtonClick}>
      <i className="fas fa-trash"></i>
    </Button>
  );
}

function Notification({ channelSlug, notification, fetchChannel }: { channelSlug: string, notification: INotificationDTO, fetchChannel: () => void }) {
  const { token } = useContext(AuthContext);
  
  return (
    <Card my={3}>
      <Card.Content>
        <Container>
          <Columns vCentered>
            <Columns.Column>
              <Heading size={4}>{notification.name}</Heading>
              <Heading size={6} subtitle>{notification.description}</Heading>
            </Columns.Column>

            <Columns.Column narrow>
              <span>{formatDistanceToNow(new Date(notification.date))} ago</span>
              { token && isAdmin(token) && <RemoveNotificationButton channelSlug={channelSlug} notificationSlug={notification.slug} fetchChannel={fetchChannel} /> }
            </Columns.Column>
          </Columns>
        </Container>
      </Card.Content>
    </Card>
  );
};

function CreateNotification({ channelSlug, fetchChannel }: { channelSlug: string, fetchChannel: () => void }) {
  const { pushMessage } = useContext(AlertsContext);

  const [modalOpened, setModalOpened] = useState(false);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [shouldNotify, setShouldNotify] = useState(true);
  const [shouldNotifyError, setShouldNotifyError] = useState('');
  const [formError, setFormError] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear all errors
    setNameError('');
    setDescriptionError('');
    setFormError('');

    addNotification(channelSlug, name, description, shouldNotify)
      .then(() => {
        pushMessage({ body: 'Successfully added new notification', color: 'success', timeout: 5000 });
        setModalOpened(false);
        fetchChannel();
      }).catch((err) => {
        if(err.response) {
          // Check for username and password errors
          if(err.response.data.error.name === 'HttpValidationError') {
            const { validationErrors } = err.response.data.error as ApiErrors.HttpValidationError;
            validationErrors.forEach(validationError => {
              if(validationError.param === 'name') setNameError(validationError.msg);
              else if(validationError.param === 'description') setDescriptionError(validationError.msg);
              else if(validationError.param === 'notify') setShouldNotifyError(validationError.msg);
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
      <Button m={1} color="link" onClick={() => setModalOpened(true)}>
        <i className="fas fa-plus"></i>
        <span style={{ marginLeft: 5 }}>Add notification</span>
      </Button>

      <Modal show={modalOpened} onClose={() => setModalOpened(false)}>
        <Modal.Card>
          <Modal.Card.Header showClose>
            <Modal.Card.Title>Add new notification</Modal.Card.Title>
          </Modal.Card.Header>

          <Modal.Card.Body>
            <form onSubmit={onSubmit}>
              <Form.Field>
                <Form.Control>
                  <Form.Input 
                    placeholder="Notification name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </Form.Control>
                { nameError && <Form.Help color="danger">{ nameError }</Form.Help>}
              </Form.Field>

              <Form.Field>
                <Form.Control>
                  <Form.Input 
                    placeholder="Notification description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </Form.Control>
                { descriptionError && <Form.Help color="danger">{ descriptionError }</Form.Help>}
              </Form.Field>

              <Form.Field>
                <Form.Control>
                  <Form.Checkbox defaultChecked={shouldNotify} onChange={e => setShouldNotify(e.target.checked)}>
                    {' '}Notify subscribers 
                  </Form.Checkbox>
                </Form.Control>
                { shouldNotifyError && <Form.Help color="danger">{ shouldNotifyError }</Form.Help>}
              </Form.Field>

              <Form.Field>
                <Form.Control>
                  <Button color="link" fullwidth>Add notification</Button>
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

export default function Channel() {
  const { token } = useContext(AuthContext);
  const { pushMessage } = useContext(AlertsContext);

  const { slug } = useParams<IParams>();
  const [channel, setChannel] = useState<IChannel | null>(null);

  const fetchChannel = useCallback(() => {
    Promise.all([
      axios.get<IChannelDTO>(`/channels/${slug}`),
      getSubscribedChannels(),
    ]).then(([ response, subscribedChannels ]) => {
      setChannel({
        ...response.data,
        subscribed: subscribedChannels.includes(response.data.slug),
      });
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
  }, [slug, pushMessage])

  useEffect(() => { fetchChannel() }, [fetchChannel]);

  const setSubscribed = (value: boolean) => {
    if(channel) setChannel({ ...channel, subscribed: value });
  }

  if(channel) {
    return (
      <>
        <Hero size="small" color="info">
          <Hero.Body>
            <Container>
              <Columns vCentered>
                <Columns.Column>
                  <Heading>{channel.name}</Heading>
                  <Heading subtitle>{channel.description}</Heading>
                </Columns.Column>

                
                <Columns.Column narrow>
                  { supportsNotifications() && <SubscribeButton slug={slug} subscribed={channel.subscribed} setSubscribed={setSubscribed} /> }
                  { token && isAdmin(token) && <CreateNotification channelSlug={slug} fetchChannel={fetchChannel} /> }
                  { token && isAdmin(token) && <RemoveChannelButton slug={slug} /> }
                </Columns.Column>
              </Columns>
            </Container>
          </Hero.Body>
        </Hero>

        <Section>
          <Container display="flex" flexDirection="column">
            <Button 
              size="small" 
              color="link" 
              inverted 
              textTransform="uppercase" 
              style={{ alignSelf: 'flex-end' }}
              onClick={fetchChannel}
            >
              Refresh
            </Button>

            { channel.notifications.length === 0 
              ? <Heading subtitle>No notifications yet.</Heading> 
              : channel.notifications.map(notification => (
                <Notification key={`${notification.slug}-${new Date(notification.date).getTime()}`} channelSlug={slug} notification={notification} fetchChannel={fetchChannel} />
              ))
            }

            { }
          </Container>
        </Section>
      </>
    );
  } else {
    return (
      <Progress marginless radiusless color="info" size="small" />
    );
  }
}