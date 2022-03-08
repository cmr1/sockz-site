import React, { useState } from 'react';
// import logo from './logo.svg';
import { Button, Form, FormGroup, FormText, Label, Input, Container, Row, Col } from 'reactstrap';
import './Login.scss';

const Login = ({ updateAuth }) => {
  const [ key, setKey ] = useState<string | null>(localStorage.getItem('clientKey'));
  const [ cert, setCert ] = useState<string | null>(localStorage.getItem('clientCert'));

  const onSubmit = (event) => {
    event.preventDefault();

    if (key && cert) {
      localStorage.setItem('clientKey', key);
      localStorage.setItem('clientCert', cert);

      updateAuth([key,cert].map(window.btoa).join(':'));
    }

    return false;
  };

  return (
    <div className="Login">
      <header>Login with client cert + key</header>
      <Form id='LoginForm' className='Form' onSubmit={onSubmit}>
        <Container>
          <Row>
            <Col>
              <FormGroup>
                <Label for='clientKey'>
                  Client Key
                </Label>
                <Input
                  id='clientKey'
                  name='clientKey'
                  type='textarea'
                  defaultValue={key || ''}
                  placeholder='PASTE KEY HERE'
                  onChange={(e) => setKey(e.target.value)}
                />
                <FormText>
                  Paste client key above (PEM format)
                </FormText>
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label for='clientCert'>
                  Client Cert
                </Label>
                <Input
                  id='clientCert'
                  name='clientCert'
                  type='textarea'
                  defaultValue={cert || ''}
                  placeholder='PASTE CERT HERE'
                  onChange={(e) => setCert(e.target.value)}
                />
                <FormText>
                  Paste client certificate above (PEM format)
                </FormText>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button block type='submit' color='success'>Authorize Client</Button>
            </Col>
          </Row>
        </Container>
      </Form>
    </div>
  );
}

export default Login;
