import React from 'react';
import './Footer.scss';

const Footer = ({ auth, authorized, updateAuth }) => {
  return (
    <div className="Footer">
      <footer className="App-footer">
        {/* {auth && authorized && <Button color='warning' onClick={() => updateAuth(null)}>Logout</Button>} */}
        <a
          className="App-link"
          href="https://localhost:4040"
        >
          &lt; back to dashboard
        </a>
      </footer>
    </div>
  );
}

export default Footer;
