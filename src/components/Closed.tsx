import React from 'react';
import './Closed.scss';

const Closed = ({ closedText }) => {
  return (
    <div className="Closed">
      <p>{closedText}</p>
    </div>
  );
}

export default Closed;
