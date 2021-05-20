import {
  Button,
  Columns,
  Container,
  Footer,
} from 'react-bulma-components';

import { AuthContext } from './contexts/auth';
import { Link } from 'react-router-dom';
import { getUsername } from './controllers/auth';
import { useContext } from 'react';

export default function FooterComponent() {
  const { token, signOut } = useContext(AuthContext);

  return (
    <Footer p={5}>
      <Container>
        <Columns>
          <Columns.Column>
            <span>
              Created by Sebastian Szczepański.
              The source code is licensed under <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.
            </span>
          </Columns.Column>
          <Columns.Column narrow display="flex" alignItems="center">
            { token ? (
              <>
                <span>Hello, { getUsername(token) }</span>
                <Button size="small" color="link" outlined ml={3} onClick={signOut}>Sign out</Button>
              </>
            ) : (
              <>
                <Button size="small" color="link" renderAs={Link} to="/sign-in">Sign in</Button>
                <Button size="small" color="link" outlined ml={3} renderAs={Link} to="/sign-in?join">Join for free</Button>
              </>
            )}
          </Columns.Column>
        </Columns>
      </Container>
    </Footer>
);
};