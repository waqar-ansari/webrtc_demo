import React, { useEffect, useState, useRef } from 'react';
import { init } from 'ys-webrtc-sdk-core';
import Session from './Session';
import Incoming from './Incoming';
import DialPad from './DialPad';
import './styles.css';

export default function App() {
  const [number, setNumber] = useState('');
  const [phone, setPhone] = useState(null);
  const [pbx, setPbx] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [incomings, setIncoming] = useState([]);
  const [cause, setCause] = useState('');
  const [showDialPad, setShowDialPad] = useState(false);
  const dialPadRef = useRef(null);
  const containerRef = useRef(null);

  const onNumberChange = (e) => {
    setNumber(e.target.value);
  };

  const onDigitClick = (digit) => {
    setNumber((prevNumber) => prevNumber + digit);
  };

  const callHandler = () => {
    console.log('Calling', number, '...');
    console.log('Phone', phone);

    if (!phone || !number) return;
    phone.call(number);
    setCause('');
  };

  const deleteIncoming = () => {
    setIncoming([]);
  };

  const handleBlur = (e) => {
    if (!e.relatedTarget || (dialPadRef.current && !dialPadRef.current.contains(e.relatedTarget))) {
      setTimeout(() => setShowDialPad(false), 200);
    }
  };

  useEffect(() => {
    console.log('init called');
    const container = containerRef.current;

    init(container, {
      username: '1007',
      secret: 'eyJleHBpcmUiOjAsInNpZ24iOiJuNTlBUlAzQlZCR2NnLzh4bGdCZG01SGRBWFNQOFBINnNON0lZY0tDSHE4PSIsInVzZXJuYW1lIjoiMTAwMSIsInZlcnNpb24iOiIxLjAifQ__', // replace with your actual secret
      pbxURL: 'https://92.98.88.156:8088',
      disableCallWaiting: true,
    })
      .then(({ phone, pbx, destroy }) => {
        console.log('init completed');

        phone.start();
        setPhone(phone);
        setPbx(pbx);

        return () => {
          destroy();
        };
      })
      .catch((err) => {
        console.log(err.message, 'error');
      });
  }, []);

  useEffect(() => {
    if (!phone) return;

    const startSession = ({ callId, session }) => {
      setSessions(Array.from(phone.sessions.values()));
    };

    const deleteSession = ({ callId, cause }) => {
      setCause(cause);
      setSessions(Array.from(phone.sessions.values()));
    };

    const incoming = ({ callId, session }) => {
      setIncoming([session]);
    };

    phone.on('startSession', startSession);
    phone.on('deleteSession', deleteSession);
    phone.on('incoming', incoming);

    return () => {
      phone.removeListener('startSession', startSession);
      phone.removeListener('deleteSession', deleteSession);
      phone.removeListener('incoming', incoming);
    };
  }, [phone]);

  useEffect(() => {
    if (!pbx) return;

    const runtimeErrorHandler = (reason) => {
      const { code, message } = reason;
      console.error(`pbx runtime error, code: ${code}, message: ${message}.`);
    };

    pbx.on('runtimeError', runtimeErrorHandler);

    return () => {
      pbx.removeListener('runtimeError', runtimeErrorHandler);
    };
  }, [pbx]);

  return (
    <div ref={containerRef} id="webrtc-container">
      <div className="App">
        <div>
          <h1>Dial a number</h1>
          <div>
            <input
              type="text"
              value={number}
              onChange={onNumberChange}
              onFocus={() => setShowDialPad(true)}
              onBlur={handleBlur}
            />
            <button onClick={callHandler}>Call</button>
            {showDialPad && <DialPad onDigitClick={onDigitClick} ref={dialPadRef} />}
          </div>
          {incomings.map((session) => (
            <Incoming
              key={session.status.callId}
              session={session}
              handler={deleteIncoming}
            />
          ))}
          {sessions.map((session) => (
            <Session key={session.status.callId} session={session} />
          ))}
        </div>
      </div>
    </div>
  );
}
