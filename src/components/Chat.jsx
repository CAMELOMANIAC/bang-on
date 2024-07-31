import React, { useEffect, useRef, useState } from 'react';
import '../styles/Chat.css';
import { IoIosSend } from 'react-icons/io';
import { AiOutlineLoading } from 'react-icons/ai';
import useChat from '../utils/hooks/useChatData';
import { createPortal } from 'react-dom';
import useMouseData from '../utils/hooks/useMouseData';
import Cursor from './Cursor';
import useCursorAnimation from '../utils/hooks/useCursorAnimation';

const Chat = () => {
    const {
        SocketRef,
        messageQueue,
        isConnected,
        messageList,
        setMessageList,
        mousePosition } = useChat();
    useMouseData(SocketRef);
    const liRefs = useRef([]);

    //useEffect(() => { console.log(mousePosition) }, [mousePosition]);

    useEffect(() => {
        // 메시지가 많아지면 투명도를 조절합니다.(큐의 크기를 기준으로 함)
        liRefs.current.forEach((item, index) => {
            const visibleLength = messageQueue.current.size / 2;
            if (liRefs.current.length > visibleLength && index < liRefs.current.length - visibleLength) {
                item.style.opacity = 1 - (liRefs.current.length - visibleLength - index) / visibleLength;
            }
        })
    }, [messageList]);// eslint-disable-line react-hooks/exhaustive-deps

    const [message, setMessage] = useState("");
    const changeMessagehandler = (e) => {
        setMessage(e.target.value);
    };

    //서버로 메시지를 전송합니다.
    const sendMessageHandler = () => {
        if (message === "") {
            return;
        }
        if (SocketRef.current) {
            SocketRef.current.emit("message", message);
            messageQueue.current.enqueue("당신:" + message);
            setMessageList(messageQueue.current.list);
            setMessage("");
        }
    };

    const cursorRef = useRef([]);//커서를 참조하기 위한 배열(매번 생성되는 커서를 참조하기 위해 외부에서 참조)
    useEffect(() => {//만약 mousePosition이 변경될때 필요없어진 ref의 크기를 줄여줍니다.
        //cursorRef.current = cursorRef.current.slice(0, mousePosition.length);
        //console.log(mousePosition);
    }, [mousePosition]);
    useCursorAnimation({ coordinates: mousePosition, elements: cursorRef.current });

    return (
        <div className='chat_container'>
            {createPortal(
                mousePosition && mousePosition.map((item, index) =>
                    <Cursor key={item + index}
                        className='other_cursor'
                        user={item[0]}
                        ref={el => cursorRef.current[index] = el} />), document.body
            )}
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