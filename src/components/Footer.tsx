import React from 'react';
import './Footer.scss';

const Footer = ({ auth, authorized, updateAuth }) => {
  return (
    <div className="Footer">
      <footer className="App-footer">
        {/* {auth && authorized && <Button color='warning' onClick={() => updateAuth(null)}>Logout</Button>} */}
        <a
          className="App-link"
          href="https://github.com/cmr1/ts-sockz#ts-sockz"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}

export default Footer;
