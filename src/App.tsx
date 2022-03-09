import React, { useEffect, useState, useCallback } from 'react';
import Closed from './components/Closed';
import Console from './components/Console';
import Footer from './components/Footer';
import Login from './components/Login';
// import logo from './logo.svg';
import { Container, Row, Col, Toast, ToastHeader, ToastBody } from 'reactstrap';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';

interface AppAlert {
  body: string;
  icon?: string | React.ReactNode;
  header?: string;
}

// const WSS_URL = 'wss://localhost:8080';
const WSS_URL = 'wss://test.sockz.io:8080';

const App = () => {
  const [ auth, setAuth ] = useState<string | null>(null);
  // const [ auth, setAuth ] = useState(localStorage.getItem('auth'));
  const [ alerts, setAlerts ] = useState<AppAlert[]>([]);
  const [ closed, setClosed ] = useState(false);
  const [ authorized, setAuthorized ] = useState(false);
  const [ consoleData, setConsoleData ] = useState('');
  // const [ socketUrl, setSocketUrl ] = useState('wss://localhost:8080');

  const debug = (name: string) => (e: any) => console.debug(`DEBUG ${name}`, e);

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(WSS_URL, {
    onClose: (e: CloseEvent) => {
      debug('onClose')(e);

      setClosed(true);
      setAuth(null);
      setAuthorized(false);
      setAlerts([]);
    },
    onError: debug('onError'),
    onMessage: debug('onMessage'),
    onOpen: debug('onOpen')
  });

  useEffect(() => {
    if (lastMessage !== null) {
      const div = document.createElement("div");
      div.innerHTML = lastMessage.data;
      const text = div.textContent || div.innerText || '';
      const data = text.trim();

      if (/^Authorized: (.*)$/i.test(data)) {
        setAuthorized(true);
        setAlerts([{
          header: 'Welcome!',
          icon: 'success',
          body: lastMessage.data
        }]);
      } else if (/^(Unauthorized|Invalid)/i.test(data)) {
        setAlerts([{
          header: 'Error!',
          icon: 'danger',
          body: lastMessage.data
        }]);
      } else {
        setConsoleData(prev => prev + lastMessage.data);
      }
    }
  }, [ auth, lastMessage ]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  const updateAuth = (auth: string) => {
    setAuth(auth);
    // localStorage.setItem('auth', auth);
  };

  const authorize = useCallback(() => {
    sendMessage(`auth:${auth}`);
  }, [ auth, sendMessage ]);

  const sendProps = {
    auth,
    authorized,
    setAuth,
    updateAuth,
    sendMessage,
    consoleData,
    setConsoleData
  };

  useEffect(() => {
    if (auth) {
      authorize();
    }
  }, [ auth, authorize ]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>sockz</h1>
      </header>
      <Container >
        <Row>
          <Col>
            {auth && authorized ? <Console {...sendProps} /> : (
              closed ? <Closed /> : <Login {...sendProps} />
            )}
          </Col>
        </Row>
        <Row>
          <Col>
            <Footer {...sendProps} />
          </Col>
        </Row>
      </Container>
      <div className='App-alerts'>
        {alerts.map((alert, index) => (
          <Toast key={index}>
            <ToastHeader icon={alert.icon}>
              {alert.header || connectionStatus}
            </ToastHeader>
            <ToastBody>
              <div dangerouslySetInnerHTML={{ __html: alert.body }}></div>
            </ToastBody>
          </Toast>
        ))}
      </div>
    </div>
  );
}

export default App;
