import { Block, Button, Container, Notification } from 'react-bulma-components';

import { AlertsContext } from './contexts/alerts';
import { useContext } from 'react';

export default function Alerts() {
  const { messages, pullMessage } = useContext(AlertsContext);

  return (
    <Container style={{ position: 'fixed', right: 10, top: 10, maxWidth: 300, zIndex: 1 }}>
      { messages.map(message => (
        <Block key={message.id}>
          <Notification color={message.color}>
            { message.body }
            <Button remove onClick={() => pullMessage(message.id)} />
          </Notification>
        </Block>
      ))}
    </Container>
  );
};