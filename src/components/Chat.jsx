import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { CircleQueue } from '../utils/function/common';
import '../styles/Chat.css';
import { IoIosSend } from 'react-icons/io';
import { useLocation } from 'react-router-dom';

const Chat = () => {
    const SocketRef = useRef(null)
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState('');
    const messageQueue = useRef(new CircleQueue(10));
    const [messageList, setMessageList] = useState([]);
    const liRefs = useRef([]);
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');

    useEffect(() => {
        // 서버 URL로 소켓 연결을 생성합니다.
        SocketRef.current = io('http://localhost:80', {
            reconnectionAttempts: 3, // 재연결 시도 횟수 설정
        });

        // 웹소켓 연결 성공시 룸 연결 이벤트
        SocketRef.current && searchParam && SocketRef.current.on('connect', () => {
            console.log('서버와 연결되었습니다 룸에 접속합니다.');
            SocketRef.current.emit('join', searchParam);
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

        // 서버로부터 'message' 이벤트를 수신하면 콘솔에 메시지를 출력합니다.
        SocketRef.current.on('messageToClient', (data) => {
            console.log('서버로부터 메시지를 받았습니다:', data);
            messageQueue.current.enqueue(data);
            setMessageList(messageQueue.current.list);
        });

        return () => {
            SocketRef.current.disconnect();// 컴포넌트가 언마운트 될 때 소켓 연결을 끊습니다.(자동으로 이벤트들도 제거됩니다.)
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        // 자동 연결이 안될때
        SocketRef.current && searchParam && SocketRef.current.emit('join', searchParam);
    }, [searchParam]);

    const changeMessagehandler = (e) => {
        setMessage(e.target.value);
    }

    //서버로 메시지를 전송합니다.
    const sendMessageHandler = () => {
        if (message === '') {
            return;
        }
        if (SocketRef.current) {
            SocketRef.current.emit('message', message);
            messageQueue.current.enqueue('당신:' + message);
            setMessageList(messageQueue.current.list);
            setMessage('');
        }
    }

    useEffect(() => {
        // 메시지가 많아지면 투명도를 조절합니다.(큐의 크기를 기준으로 함)
        liRefs.current.forEach((item, index) => {
            const visibleLength = messageQueue.current.size / 2;
            if (liRefs.current.length > visibleLength && index < liRefs.current.length - visibleLength) {
                item.style.opacity = 1 - (liRefs.current.length - visibleLength - index) / visibleLength;
            }
        })
    }, [messageList]);

    return (
        <div className='chat_container'>
            <ul>
                {messageList && messageList.map((item, index) =>
                    item && <li key={index}
                        ref={el => liRefs.current[index] = el}
                    >{item}</li>)}
            </ul>
            <div className='input_container'>
                <input type='text' onChange={changeMessagehandler} value={message}>
                </input>
                <button onClick={sendMessageHandler}><IoIosSend /></button>
            </div>
        </div>
    );
};

export default Chat;