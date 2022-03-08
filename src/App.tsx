import React, { useEffect } from 'react';
import Console from './components/Console';
// import logo from './logo.svg';
// import { Button } from 'reactstrap';
import { importRsaKey, PUBLIC_KEY } from './helpers';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  useEffect(() => {
    importRsaKey(PUBLIC_KEY).then((publicKey) => {
      console.log('Imported public key', publicKey);
    }).catch(console.error);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>sockz</h1>
        <a
          className="App-link"
          href="https://github.com/cmr1/ts-sockz#ts-sockz"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
        {/* <Button color='danger'>DANGER</Button> */}
        <Console />
      </header>
    </div>
  );
}

export default App;
