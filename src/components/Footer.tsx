import React from 'react';
import './Footer.scss';

const { REACT_APP_SOCKZ_HOST } = process.env;

const Footer = ({ auth, authorized, updateAuth }) => {
  return (
    <div className="Footer">
      <footer className="App-footer">
        {/* {auth && authorized && <Button color='warning' onClick={() => updateAuth(null)}>Logout</Button>} */}
        <a
          className="App-link"
          href={`https://${REACT_APP_SOCKZ_HOST}`}
        >
          &lt; back to dashboard
        </a>
      </footer>
    </div>
  );
}

export default Footer;
