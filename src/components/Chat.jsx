import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { CircleQueue } from '../utils/function/common';

const Chat = () => {
    const SocketRef = useRef(null)
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState('');
    const messageQueue = useRef(new CircleQueue(5));
    const [messageList, setMessageList] = useState([]);

    useEffect(() => {
        // 서버 URL로 소켓 연결을 생성합니다.
        SocketRef.current = io('http://localhost:3000', {
            reconnectionAttempts: 3, // 재연결 시도 횟수 설정
        });

        // 연결 성공 이벤트
        SocketRef.current.on('connect', () => {
            console.log('서버와 연결되었습니다.');
            SocketRef.current.emit('join', 'room1');
            setIsConnected(true);
        });

        // 연결 끊김 이벤트
        SocketRef.current.on('disconnect', () => {
            console.log('서버와 연결이 끊겼습니다.');
            setIsConnected(false);
        });

        // 재연결 시도 이벤트
        SocketRef.current.on('reconnect_attempt', (attempt) => {
            console.log(`재연결 시도 중... (${attempt})`);
        });

        // 재연결 실패 이벤트
        SocketRef.current.on('reconnect_failed', () => {
            console.log('서버와 연결할 수 없습니다.');
            setIsConnected(false);
        });

        // 서버에 'message' 이벤트를 발생시킵니다.
        // process.stdin.on('data', (data) => {
        //     const input = data.toString().trim();
        //     SocketRef.current.emit('message', input);
        // });

        // 서버로부터 'message' 이벤트를 수신하면 콘솔에 메시지를 출력합니다.
        SocketRef.current.on('messageToClient', (data) => {
            console.log('서버로부터 메시지를 받았습니다:', data);
            messageQueue.current.enqueue(data);
            setMessageList(messageQueue.current.list)
        });

        return () => {
            SocketRef.current.disconnect();
        };
    }, []);

    const changeMessagehandler = (e) => {
        setMessage(e.target.value);
    }
    const sendMessageHandler = () => {
        if (message === '') {
            return;
        }
        if (SocketRef.current) {
            SocketRef.current.emit('message', message);
            setMessage('');
        }
    }

    useEffect(() => { console.log(messageList) }, [messageList]);

    return (
        <div>
            <input type='text' onChange={changeMessagehandler} value={message}>
            </input>
            <button onClick={sendMessageHandler}>전송</button>
            <ul>
                {messageList && messageList.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
    );
};

export default Chat;