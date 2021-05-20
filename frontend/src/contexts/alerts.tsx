import React, { createContext, useCallback, useState } from "react";

import ReactBulmaComponents from "react-bulma-components/src/components";
import shortid from "shortid";

export interface AlertMessage {
  body: string;
  color: ReactBulmaComponents.Color;
  timeout?: number;
};

interface AlertContext extends AlertMessage {
  id: string;
};

interface AlertsContextState {
  messages: AlertContext[];
  pushMessage: (message: AlertMessage) => void;
  pullMessage: (id: AlertContext["id"]) => void;
};

const initialContextState: AlertsContextState = {
  messages: [],
  pushMessage: () => {},
  pullMessage: () => {},
};

export const AlertsContext = createContext<AlertsContextState>(initialContextState);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<AlertContext[]>(initialContextState.messages);

  const pullMessage = useCallback((id: AlertContext["id"]) => {
    setMessages(messages => messages.filter(message => message.id !== id));
  }, []);

  const pushMessage = useCallback((message: AlertMessage) => {
    const id = shortid.generate();

    setMessages(messages => [
      { ...message, id }, 
      ...messages,
    ]);

    if(message.timeout) setTimeout(() => pullMessage(id), message.timeout);
  }, [pullMessage]);

  return (
    <AlertsContext.Provider value={{ messages, pushMessage, pullMessage }}>
      { children }
    </AlertsContext.Provider>
  );
}