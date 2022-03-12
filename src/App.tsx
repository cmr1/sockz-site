import React, { useEffect, useState, useCallback } from 'react';
import Closed from './components/Closed';
import Console from './components/Console';
import Footer from './components/Footer';
import Login from './components/Login';
// import logo from './logo.svg';
import { Container, Row, Col, Toast, ToastHeader, ToastBody, Spinner } from 'reactstrap';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';

const { REACT_APP_SOCKZ_HOST = 'localhost:4040' } = process.env;

// const WSS_URL = 'wss://localhost:4040';
// const WSS_URL = 'wss://test.sockz.io:4040';
const WSS_URL = `wss://${REACT_APP_SOCKZ_HOST}`;
const WEB_URL = `https://${REACT_APP_SOCKZ_HOST}`;

interface AppAlert {
  body: string;
  icon?: string | React.ReactNode;
  header?: string;
}

interface fetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

async function fetchWithTimeout(resource, options: fetchWithTimeoutOptions = {}) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}

async function healthy() {
  try {
    const res = await fetchWithTimeout(`${WEB_URL}/health`, { timeout: 5000 });
    const data = await res.json();
    return !!data;
  } catch (err) {
    return false;
  }
}

const App = () => {
  // TODO: Set in state and allow dynamic change/reconnect to another host?
  // const [ host, setHost ] = useState(REACT_APP_SOCKZ_HOST);
  const [ auth, setAuth ] = useState<string | null>(null);
  // const [ auth, setAuth ] = useState(localStorage.getItem('auth'));
  const [ alerts, setAlerts ] = useState<AppAlert[]>([]);
  const [ closed, setClosed ] = useState(true);
  const [ closedText, setClosedText ] = useState('Not Connected.');
  const [ authorized, setAuthorized ] = useState(false);
  const [ consoleData, setConsoleData ] = useState('');
  // const [ socketUrl, setSocketUrl ] = useState('wss://localhost:4040');

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
      setClosedText('Connection Closed. Refresh to reconnect.');
      setAlerts([]);
    },
    onError: debug('onError'),
    onMessage: debug('onMessage'),
    onOpen: (e: Event) => {
      debug('onOpen')(e);
      healthCheck();
    }
  });

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  const healthCheck = useCallback(async () => {
    setAlerts([{
      header: connectionStatus,
      icon: <Spinner size='sm'>Loading...</Spinner>,
      body: `Waiting for: <span class="badge bg-primary">${REACT_APP_SOCKZ_HOST}</span>`
    }]);

    const alive = await healthy();

    if (!alive) {
      setAuth(null);
      setAuthorized(false);
      setClosed(true);
      setAlerts([{
        header: `Server failed health check`,
        icon: <span>💔</span>,
        body: `<span class="badge bg-danger">${REACT_APP_SOCKZ_HOST}</span> is not responding`
      }])
    } else {
      setClosed(false);
      setAlerts([{
        header: `Server is running`,
        icon: <span>✅</span>,
        body: `<span class="badge bg-primary">${REACT_APP_SOCKZ_HOST}</span> is running`
      }]);
    }
  }, [ connectionStatus ]);

  useEffect(() => {
    healthCheck();
  }, [ healthCheck ]); 

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
          icon: <span>👤</span>,
          body: lastMessage.data
        }]);
      } else if (/^(Unauthorized|Invalid)/i.test(data)) {
        setAlerts(prev => prev.concat([{
          header: 'Error!',
          icon: <span>🔥</span>,
          body: lastMessage.data
        }]));
      } else {
        setConsoleData(prev => prev + lastMessage.data);
      }
    }
  }, [ auth, lastMessage ]);


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
        <img className='App-logo' src='/img/logo.png' alt='Sockz Logo' />
        <h1 className='App-name'>sockz</h1>
      </header>
      <Container>
        <Row>
          <Col>
            {auth && authorized ? <Console {...sendProps} /> : (
              closed ? <Closed {...{ closedText }} /> : <Login {...sendProps} />
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
            <ToastBody className='text-secondary'>
              <div dangerouslySetInnerHTML={{ __html: alert.body }}></div>
            </ToastBody>
          </Toast>
        ))}
      </div>
    </div>
  );
}

export default App;
