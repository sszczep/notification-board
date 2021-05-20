import * as ApiErrors from './utils/apiErrors';
import * as AuthController from './controllers/auth';

import {
  Button,
  Container,
  Form,
  Icon,
  Tabs,
} from 'react-bulma-components';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { AuthContext } from './contexts/auth';

function SignInForm() {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const { signIn } = useContext(AuthContext);

  const history = useHistory();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear all errors
    setUsernameError('');
    setPasswordError('');
    setFormError('');

    AuthController.signIn(username, password)
      .then(token => {
        signIn(token);
        history.push("/");
      }).catch((err) => {
        if(err.response) {
          // Check for username and password errors
          if(err.response.data.error.name === 'HttpValidationError') {
            const { validationErrors } = err.response.data.error as ApiErrors.HttpValidationError;
            validationErrors.forEach(validationError => {
              if(validationError.param === 'username') setUsernameError(validationError.msg);
              else if(validationError.param === 'password') setPasswordError(validationError.msg);
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
    <form onSubmit={onSubmit}>
      <Form.Field>
        <Form.Control>
          <Form.Input 
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <Icon align="left" size="small">
            <i className="fas fa-user" />
          </Icon>
        </Form.Control>
        { usernameError && <Form.Help color="danger">{ usernameError }</Form.Help>}
      </Form.Field>

      <Form.Field>
        <Form.Control>
          <Form.Input 
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Icon align="left" size="small">
            <i className="fas fa-lock" />
          </Icon>
        </Form.Control>
        { passwordError && <Form.Help color="danger">{ passwordError }</Form.Help>}
      </Form.Field>

      <Form.Field>
        <Form.Control>
          <Button color="link" fullwidth>Sign in</Button>
        </Form.Control>
        { formError && <Form.Help color="danger">{ formError }</Form.Help>}
      </Form.Field>
    </form>
  );
};

function SignUpForm() {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const { signIn } = useContext(AuthContext);

  const history = useHistory();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear all errors
    setUsernameError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFormError('');

    // Check if passwords match
    if(password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    AuthController.signUp(username, password)
      .then(token => {
        signIn(token);
        history.push("/");
      }).catch((err) => {
        if(err.response) {
          // Check for username and password errors
          if(err.response.data.error.name === 'HttpValidationError') {
            const { validationErrors } = err.response.data.error as ApiErrors.HttpValidationError;
            validationErrors.forEach(validationError => {
              if(validationError.param === 'username') setUsernameError(validationError.msg);
              else if(validationError.param === 'password') setPasswordError(validationError.msg);
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
    <form onSubmit={onSubmit}>
      <Form.Field>
        <Form.Control>
          <Form.Input 
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <Icon align="left" size="small">
            <i className="fas fa-user" />
          </Icon>
        </Form.Control>
        { usernameError && <Form.Help color="danger">{ usernameError }</Form.Help>}
      </Form.Field>

      <Form.Field>
        <Form.Control>
          <Form.Input 
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Icon align="left" size="small">
            <i className="fas fa-lock" />
          </Icon>
        </Form.Control>
        { passwordError && <Form.Help color="danger">{ passwordError }</Form.Help>}
      </Form.Field>

      <Form.Field>
        <Form.Control>
          <Form.Input 
            placeholder="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <Icon align="left" size="small">
            <i className="fas fa-lock" />
          </Icon>
        </Form.Control>
        { confirmPasswordError && <Form.Help color="danger">{ confirmPasswordError }</Form.Help>}
      </Form.Field>

      <Form.Field>
        <Form.Control>
          <Button color="link" fullwidth>Sign up</Button>
        </Form.Control>
        { formError && <Form.Help color="danger">{ formError }</Form.Help>}
      </Form.Field>
    </form>
  );
};

export default function SignIn() {
  const [selectedTab, setSelectedTab] = useState('sign-in');

  const location = useLocation();

  useEffect(() => {
    const joinQuery = new URLSearchParams(location.search).get('join');

    // If join is in query parameters, set the tab to sign up
    if(joinQuery !== null) setSelectedTab('sign-up');
    else setSelectedTab('sign-in');
  }, [location.search]);

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
      <Tabs size="large" align="right">
        <Tabs.Tab 
          active={selectedTab === 'sign-in'} 
          onClick={() => setSelectedTab('sign-in')}
        >
          I have an account
        </Tabs.Tab>
        <Tabs.Tab 
          active={selectedTab === 'sign-up'} 
          onClick={() => setSelectedTab('sign-up')}
        >
          Join for free
        </Tabs.Tab>
      </Tabs>

      { selectedTab === 'sign-in' && <SignInForm /> } 
      { selectedTab === 'sign-up' && <SignUpForm /> } 
    </Container>
  );
};