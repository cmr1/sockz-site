import React, { useState } from 'react';
// import logo from './logo.svg';
import { Button, Form, FormGroup, FormText, Input, Container, Row, Col } from 'reactstrap';
import './Login.scss';

const Login = ({ updateAuth, registerClient }) => {
  const [ clientName, setClientName ] = useState<string | null>(null);
  const [ clientPassword, setClientPassword ] = useState<string | null>(null);

  const onSubmit = async (event) => {
    event.preventDefault();

    const [ok, auth] = await registerClient(clientName, clientPassword);

    if (ok && auth) {
      localStorage.setItem('auth', auth);
      updateAuth(auth);
    }

    return false;
  };

  return (
    <div className="Login">
      <Form id='LoginForm' className='Form' onSubmit={onSubmit}>
        <Container>
          <Row>
            <Col lg={{ size: 4, offset: 4 }} md={{ size: 6, offset: 3 }}>
              <FormGroup>
                <Input
                  id='clientName'
                  name='clientName'
                  type='text'
                  placeholder='Fred Flinstone'
                  onChange={(e) => setClientName(e.target.value)}
                />
                <FormText>
                  Register a new session with this Client Name
                </FormText>
              </FormGroup>
              {/* <FormGroup>
                <Input
                  id='clientPassword'
                  name='clientPassword'
                  type='password'
                  placeholder='Client Password'
                  onChange={(e) => setClientPassword(e.target.value)}
                />
                <FormText>
                  Set a password for this session
                </FormText>
              </FormGroup> */}
              <Button block type='submit' color='success'>New Client Session</Button>
            </Col>
          </Row>
        </Container>
      </Form>
    </div>
  );
}

export default Login;
