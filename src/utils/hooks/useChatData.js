import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import { CircleQueue } from "../function/common";
import { useSocketClientId } from "../store/store";

/**
 * chat 기능을 위한 custom hook
 *
 * @returns {{
 * SocketRef: {current: null};
 * messageQueue: {current: CircleQueue};
 * isConnected: boolean;
 * messageList: any[];
 * setMessageList: React.Dispatch<React.SetStateAction<never[]>>;
 * mousePosition: any[];
 * }}
 */
const useChat = () => {
	const SocketRef = useRef(null);
	const [isConnected, setIsConnected] = useState(false);
	const messageQueue = useRef(new CircleQueue(10));
	const [messageList, setMessageList] = useState([]);
	const location = useLocation();
	const [mousePosition, setMousePosition] = useState([]);
	const [isBackground, setIsBackground] = useState(false);
	const [notificationMessage, setNotificationMessage] = useState("");
	const { setClientId } = useSocketClientId();

	const queryParams = new URLSearchParams(location.search);
	const searchParam = queryParams.get("search");

	useEffect(() => {
		// 서버 URL로 소켓 연결을 생성합니다.
		SocketRef.current = io("http://localhost:80", {
			reconnectionAttempts: 3 // 재연결 시도 횟수 설정
		});

		// 웹소켓 연결 성공시 룸 연결 이벤트
		SocketRef.current.on("connect", () => {
			const roomName = searchParam || "lobby";
			SocketRef.current.emit("join", roomName);
			setIsConnected(true);
		});

		// 연결 끊김 이벤트
		SocketRef.current.on("disconnect", () => {
			messageQueue.current.enqueue("서버와 연결이 끊겼습니다.");
			setIsConnected(false);
		});

		// 웹소켓 연결시 클라이언트의 자기 식별번호를 전달해주는 이벤트
		SocketRef.current.on("clientId", (data) => {
			setClientId(data);
		});

		// 재연결 시도 이벤트
		SocketRef.current.on("reconnect_attempt", (attempt) => {
			messageQueue.current.enqueue(`재연결 시도 중... (${attempt})`);
		});

		// 재연결 실패 이벤트
		SocketRef.current.on("reconnect_failed", () => {
			messageQueue.current.enqueue("서버와 연결할 수 없습니다.");
			setIsConnected(false);
		});

		// 서버로부터 'message' 이벤트를 수신하면 콘솔에 메시지를 출력합니다.
		SocketRef.current.on("messageToClient", (data) => {
			messageQueue.current.enqueue(data);
			setMessageList(messageQueue.current.list);
			setNotificationMessage(data);
		});

		// 서버로부터 'mousePostionToClient' 이벤트를 수신하면 콘솔에 메시지를 출력합니다.
		SocketRef.current.on("mousePostionToClient", (data) => {
			setMousePosition(data);
		});

		return () => {
			SocketRef.current.disconnect(); // 컴포넌트가 언마운트 될 때 소켓 연결을 끊습니다.(자동으로 이벤트들도 제거됩니다.)
			setIsConnected(false);
		};
	}, [searchParam, setClientId]);

	//백그라운드 전환시 메세지 알림
	useEffect(() => {
		if (!isBackground) {
			setNotificationMessage("");
		}
		if (isBackground && notificationMessage !== "") {
			new Notification("채팅 알림", {
				body: notificationMessage
			});
		}
	}, [notificationMessage, isBackground]);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				setIsBackground(true);
			} else {
				setIsBackground(false);
			}
		};

		const handleFocus = () => {
			setIsBackground(false);
		};
		const handleBlur = () => {
			setIsBackground(true);
		};

		document.addEventListener("visibilitychange", handleVisibilityChange); //브라우저 탭간 전환시 발생하는 이벤트
		window.addEventListener("focus", handleFocus); //브라우저가 포커스를 얻었을때 발생하는 이벤트
		window.addEventListener("blur", handleBlur); //브라우저가 포커스를 잃었을때 발생하는 이벤트
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("focus", handleFocus);
			window.removeEventListener("blur", handleBlur);
		};
	}, []);

	useEffect(() => {
		// 검색 파라미터가 있으면 해당 룸에 접속합니다.
		SocketRef.current && searchParam && SocketRef.current.emit("join", searchParam);
		setIsConnected(true);
	}, [searchParam]);

	return {
		SocketRef,
		messageQueue,
		isConnected,
		messageList,
		setMessageList,
		mousePosition
	};
};

export default useChat;
