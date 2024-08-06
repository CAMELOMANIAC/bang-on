import React, { useEffect, useRef, useState } from 'react';
import '../styles/Chat.css';
import { IoIosSend } from 'react-icons/io';
import { AiOutlineLoading } from 'react-icons/ai';
import useChat from '../utils/hooks/useChatData';
import { createPortal } from 'react-dom';
import useMouseData from '../utils/hooks/useMouseData';
import Cursor from './Cursor';
import { useSocketClientId } from '../utils/store/store';

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
    const { clientId } = useSocketClientId();

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

    return (
        <div className='chat_container'>
            {createPortal(
                Object.keys(mousePosition)?.map((item) =>
                    item !== clientId &&
                    <Cursor key={item}
                        className='other_cursor'
                        data={mousePosition[item]}
                        name={item} />), document.body
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