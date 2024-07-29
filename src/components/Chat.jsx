import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { CircleQueue } from '../utils/function/common';
import '../styles/Chat.css';
import { IoIosSend } from 'react-icons/io';
import { useLocation } from 'react-router-dom';
import { AiOutlineLoading } from 'react-icons/ai';
import { FaMousePointer } from 'react-icons/fa';

const Chat = () => {
    const SocketRef = useRef(null)
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState('');
    const messageQueue = useRef(new CircleQueue(10));
    const [messageList, setMessageList] = useState([]);
    const liRefs = useRef([]);
    const location = useLocation();
    const [mousePosition, setMousePosition] = useState([]);

    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');

    useEffect(() => {
        // 서버 URL로 소켓 연결을 생성합니다.
        SocketRef.current = io('http://localhost:80', {
            reconnectionAttempts: 3, // 재연결 시도 횟수 설정
        });

        // 웹소켓 연결 성공시 룸 연결 이벤트
        SocketRef.current && SocketRef.current.on('connect', () => {
            SocketRef.current.emit('join', 'lobby');
            setIsConnected(true);
        });

        // 연결 끊김 이벤트
        SocketRef.current.on('disconnect', () => {
            messageQueue.current.enqueue('서버와 연결이 끊겼습니다.');
            setIsConnected(false);
        });

        // 재연결 시도 이벤트
        SocketRef.current.on('reconnect_attempt', (attempt) => {
            messageQueue.current.enqueue(`재연결 시도 중... (${attempt})`);
        });

        // 재연결 실패 이벤트
        SocketRef.current.on('reconnect_failed', () => {
            messageQueue.current.enqueue('서버와 연결할 수 없습니다.');
            setIsConnected(false);
        });

        // 서버로부터 'message' 이벤트를 수신하면 콘솔에 메시지를 출력합니다.
        SocketRef.current.on('messageToClient', (data) => {
            messageQueue.current.enqueue(data);
            setMessageList(messageQueue.current.list);
        });

        // 서버로부터 'mousePostionToClient' 이벤트를 수신하면 콘솔에 메시지를 출력합니다.
        SocketRef.current.on('mousePostionToClient', (data) => {
            console.log(data);
            setMousePosition(data);
        });

        return () => {
            SocketRef.current.disconnect();// 컴포넌트가 언마운트 될 때 소켓 연결을 끊습니다.(자동으로 이벤트들도 제거됩니다.)
            setIsConnected(false);
        };
    }, []);

    useEffect(() => {
        // 검색 파라미터가 있으면 해당 룸에 접속합니다.
        SocketRef.current && searchParam && SocketRef.current.emit('join', searchParam);
        setIsConnected(true);
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

    const mousePositionRef = useRef([]);
    useEffect(() => {
        // 마우스 이벤트를 추가합니다.
        const mouseMoveHandler = (e) => {
            const position = mousePositionRef.current;
            let x1 = 0, y1 = 0;

            if (position.length > 0) {
                x1 = position[position.length - 1].x;
                y1 = position[position.length - 1].y;
            }
            let x2 = e.pageX;
            let y2 = e.pageY;

            let distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            if (distance > 100) {
                mousePositionRef.current.push({ x: e.pageX, y: e.pageY, time: Date.now() });
            }
        }
        document.addEventListener('mousemove', mouseMoveHandler);

        const interval = setInterval(() => {
            if (mousePositionRef.current.length > 0) {
                if (SocketRef.current) {
                    SocketRef.current.emit('mousePosition', mousePositionRef.current);
                }
                mousePositionRef.current = [];
            }
        }, 1000);

        return () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            clearInterval(interval);
        }
    }, []);

    return (
        <div className='chat_container'>
            <FaMousePointer style={{ position: 'absolute' }} />
            <ul>
                {messageList && messageList.map((item, index) =>
                    item && <li key={index}
                        ref={el => liRefs.current[index] = el}
                    >{item}</li>)}
            </ul>
            <div className='input_container'>
                <input type='text' onChange={changeMessagehandler} value={message}>
                </input>
                <button onClick={sendMessageHandler}>{isConnected ? <IoIosSend /> : <AiOutlineLoading className='animate_spinner' />}</button>
            </div>
        </div>
    );
};

export default Chat;