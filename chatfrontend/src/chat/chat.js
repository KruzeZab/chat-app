import './chat.css';
import { to_Decrypt, to_Encrypt } from '../aes.js';
import { process } from '../store/action/index';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

function Chat({ username, roomname, socket }) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [disable, setDisable] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setErrorMsg('');
    }, 5000);
  }, [errorMsg]);

  const dispatch = useDispatch();

  const dispatchProcess = (encrypt, msg, cipher) => {
    dispatch(process(encrypt, msg, cipher));
  };

  useEffect(() => {
    socket.on('message', (data) => {
      //decypt
      const ans = to_Decrypt(data.text, data.username);
      dispatchProcess(false, ans, data.text);
      console.log(ans);
      let temp = messages;
      temp.push({
        userId: data.userId,
        username: data.username,
        text: ans,
      });
      setMessages([...temp]);
    });
  }, [socket]);

  const sendData = async () => {
    if (text !== '') {
      //encrypt here
      const ans = to_Encrypt(text);
      socket.emit('chat', ans);
      setText('');
    }
    const { hate_speech, message } = await checkHateSpeech(text);
    console.log(hate_speech, message);

    if (hate_speech) {
      setErrorMsg('Warning: Hate speech detected!');
      // setDisable(true);
      console.log('hate speech detected');
      // alert('Hate speech detected');
    }
  };
  const messagesEndRef = useRef(null);

  const checkHateSpeech = async (text) => {
    const response = await fetch('http://127.0.0.1:8001/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/json',
      },
      body: JSON.stringify({
        text,
      }),
    });
    const data = await response.json();

    return data;
  };

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  console.log(messages, 'mess');

  return (
    <div className="chat">
      {!!errorMsg && (
        <h4 style={{backgroundColor: 'red', padding: 5, borderRadius: 4}}>Hate speech detected in your chat</h4>
      )}
      <div className="user-name">
        <h2>
          {username}{' '}
          <span style={{ fontSize: '0.7rem' }}>in {roomname}</span>
        </h2>
      </div>
      <div className="chat-message">
        {messages.map((i) => {
          if (i.username === username) {
            return (
              <div className="message">
                <p>{i.text}</p>
                <span>{i.username}</span>
              </div>
            );
          } else {
            return (
              <div className="message mess-right">
                <p>{i.text} </p>
                <span>{i.username}</span>
              </div>
            );
          }
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="send">
        <input
          disabled={disable}
          placeholder="enter your message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendData();
            }
          }}
        ></input>
        <button onClick={sendData}>Send</button>
      </div>
    </div>
  );
}
export default Chat;
