import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Button } from 'reactstrap';
import './Console.scss';

const Console = ({ consoleData, sendMessage, setConsoleData }) => {
  const ref = useRef<HTMLPreElement>(null);
  const [ buff, setBuff ] = useState<string[]>([]);
  const [ active, setActive ] = useState(false);

  const remove = (num?: number) => setConsoleData((current) => current.slice(0, num || -1));
  const append = (data: string) => setConsoleData((current) => current + data);
  const activate = () => setActive(true);
  const deactivate = () => setActive(false);

  useEffect(() => {
    // Triggered when use leaves page/tab
    const handleVisibility = () => {
      deactivate();
    };

    // Listen to click event and set active if clicking console
    const handleClick = (event: MouseEvent) => {
      if (ref?.current?.contains(event.target as Node)) {
        activate();
      } else {
        deactivate();
      }
    };

    // Bind event listeners on mount
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('mousedown', handleClick);

    return () => {
      // Remove event listeners on unmount
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ ref ]);

  const handleSpecialKey  = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'v':
      case 'V':
        if (event.ctrlKey) {
          navigator.clipboard.readText().then((copied) => {
            if (copied) {
              console.debug('Pasting copied text:', copied);
              append(copied);
              setBuff(buff.concat(Array.from(copied)));
            }
          });
        }
        break;
      default:
        if (event.key.length === 1) {
          append(event.key);
          setBuff([...buff, event.key]);
        } else {
          console.debug('Ignore special key', event);
        }
        break;
    }
  }, [ buff ]);

  const handleKey = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      // case 'Alt':
      // case 'Meta':
      // case 'Control':
      // case 'Shift':
      //   console.debug('Ignoring key', event.key);
      //   break;
      case 'Enter':
        console.debug('Send cmd', buff.join(''));
        sendMessage(buff.join(''));
        append(`\r\n`);
        setBuff([]);
        break;
      case 'Backspace':
        if (buff.length) {
          remove();
          setBuff(buff.slice(0, -1));
        }
        break;
      default:
        if (event.altKey || event.ctrlKey || event.shiftKey) {
          handleSpecialKey(event);
        } else if (event.key.length === 1) {
          append(event.key);
          setBuff([...buff, event.key]);
        } else {
          console.debug('Ignoring key', event.key);
        }
        break;
    }
  }, [ buff, sendMessage, append, remove, handleSpecialKey ]);

  useEffect(() => {
    if (active) {
      document.addEventListener('keydown', handleKey);
    } else {
      document.removeEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [ active, handleKey ]);

  return (
    <div className={`Console ${active ? 'active' : ''}`}>
      <pre ref={ref} onClick={() => setActive(true)} dangerouslySetInnerHTML={{ __html: consoleData }}></pre>
    </div>
  );
}

export default Console;
