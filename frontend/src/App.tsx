import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";

import Alerts from "./Alerts";
import { AlertsProvider } from './contexts/alerts';
import { AuthProvider } from './contexts/auth';
import Channel from './Channel';
import Footer from './Footer';
import Main from './Main';
import SignIn from './SignIn';

export default function App() {
  return (
    <AlertsProvider>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Router>
            <Alerts />

            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Switch>
                <Route exact path="/">
                  <Main />
                </Route>
                <Route path="/channel/:slug">
                  <Channel />
                </Route>
                <Route path="/sign-in">
                  <SignIn />
                </Route>
                <Route path="*">
                  <Redirect to="/" />
                </Route>
              </Switch>
            </div>

            <Footer />
          </Router>
        </div>
      </AuthProvider>
    </AlertsProvider>
  );
};