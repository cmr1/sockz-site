import React, { useEffect, useState, useCallback } from 'react';
import qs from 'qs';
import Closed from './components/Closed';
import Console from './components/Console';
import Footer from './components/Footer';
import Login from './components/Login';
// import logo from './logo.svg';
import { Container, Row, Col, Toast, ToastHeader, ToastBody, Spinner } from 'reactstrap';
import useWebSocket, { ReadyState } from 'react-use-websocket';
// import { useSearchParams } from 'react-router-dom';
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
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
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

const token = (token?: string) => token ? localStorage.setItem('token', token) : localStorage.getItem('token');

async function healthy(): Promise<[boolean, string, string?]> {
  try {
    const res = await fetchWithTimeout(`${WEB_URL}/health`, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token()}`
      }
    });
    const data = await res.json();
    return [res.status < 400, data.message];
  } catch (err) {
    if (err && typeof err === 'object') {
      // TODO: WTF why dis no work?
      return [false, err['message'], err['error']];
    } else {
      console.warn(err);
      return [false, err as string];
    }
  }
}

async function registerClient(clientName: string, clientPassword: string): Promise<[boolean,string]> {
  try {
    const res = await fetchWithTimeout(`${WEB_URL}/api/client/register`, {
      method: 'POST',
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token()}`
      },
      body: JSON.stringify({
        clientName,
        clientPassword
      })
    });
    const data = await res.json();
    console.debug('Authenticate', data);
    return [res.status < 400, data.auth];
  } catch (err) {
    console.warn(err);
    return [false, err as string];
  }
}

const App = () => {
  // TODO: Set in state and allow dynamic change/reconnect to another host?
  // const [ host, setHost ] = useState(REACT_APP_SOCKZ_HOST);
  const [ auth, setAuth ] = useState<string | null>(null);
  const [ alerts, setAlerts ] = useState<AppAlert[]>([]);
  const [ closed, setClosed ] = useState(true);
  const [ closedText, setClosedText ] = useState('Not Connected.');
  const [ authorized, setAuthorized ] = useState(false);
  const [ consoleData, setConsoleData ] = useState('');
  // const [ socketUrl, setSocketUrl ] = useState('wss://localhost:4040');
  // const [ searchParams, setSearchParams ] = useSearchParams();

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
    const StatusIcon = () => {
      if (/open/i.test(connectionStatus)) {
        return <span>✅</span>;
      } else if (/closed/i.test(connectionStatus)) {
        return <span>❌</span>
      } else {
        return <Spinner size='sm'>Loading...</Spinner>;
      }
    };

    setAlerts([{
      header: connectionStatus,
      icon: <StatusIcon />,
      body: `Waiting`,
      color: 'warning'
    }]);

    const [alive, message, title] = await healthy();

    if (!alive) {
      setAuth(null);
      setAuthorized(false);
      setClosed(true);
      setAlerts([{
        header: title || 'Error',
        icon: <span>💔</span>,
        body: message,
        color: 'danger'
      }])
    } else {
      setClosed(/closed/i.test(connectionStatus));
      // setAlerts([{
      //   header: title || 'OK',
      //   icon: <span>✅</span>,
      //   body: message,
      //   color: 'success'
      // }]);
    }
  }, [ connectionStatus ]);

  useEffect(() => {
    healthCheck();
  }, [ healthCheck ]);

  useEffect(() => {
    if (window.location.search) {
      const params: { token?: string } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
      console.debug('Authenticating:', params);

      if (params.token) {
        token(params.token);
      } else {
        console.debug('WHy u sending deeees parameeeterrsss?', params);
      }

      window.location.replace('/');
    }
  }, []);

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
          body: lastMessage.data,
          color: 'info'
        }]);
      } else if (/^(Error|Invalid)/i.test(data)) {
        setAlerts(prev => prev.concat([{
          header: 'Error!',
          icon: <span>🔥</span>,
          body: lastMessage.data,
          color: 'danger'
        }]));
      } else {
        setConsoleData(prev => prev + lastMessage.data);
      }
    }
  }, [ auth, lastMessage ]);


  const updateAuth = (auth: string) => {
    setAuth(auth);
    localStorage.setItem('auth', auth);
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
    setConsoleData,
    registerClient
  };

  useEffect(() => {
    if (auth) {
      authorize();
    }
  }, [ auth, authorize ]);

  return (
    <div className="App">
      <header className="App-header">
        <img className='App-logo' src='/img/logo.png' alt='sockz logo' />
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
              <span dangerouslySetInnerHTML={{ __html: (alert.header || connectionStatus) }}></span>
              <span className={`badge bg-${alert.color || 'primary'}`}>{REACT_APP_SOCKZ_HOST}</span>
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
