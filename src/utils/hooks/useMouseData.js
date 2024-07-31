import { useEffect, useRef } from "react";

const useMouseData = (SocketRef) => {
	const mousePositionRef = useRef([]);
	const lastMousePositionRef = useRef(null); // 마지막 마우스 위치를 추적하는 변수

	//마우스 위치를 수집합니다(최소 50px 이동시 수집)
	useEffect(() => {
		const mouseMoveHandler = (e) => {
			const position = mousePositionRef.current;
			let x1 = 0,
				y1 = 0;

			if (position.length > 0) {
				x1 = position[position.length - 1].x;
				y1 = position[position.length - 1].y;
			}
			let x2 = e.pageX;
			let y2 = e.pageY;

			let distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
			if (distance > 50) {
				mousePositionRef.current.push({ x: e.pageX, y: e.pageY, time: Date.now() });
			}
			lastMousePositionRef.current = { x: e.pageX, y: e.pageY, time: Date.now() }; // 마지막 마우스 위치 업데이트
		};
		document.addEventListener("mousemove", mouseMoveHandler);

		//수집한 마우스 위치를 1초마다 전송합니다.(최소 실제 마우스와의 1초의 지연이 발생함 서버쪽에서 대기시간 +알파)
		const interval = setInterval(() => {
			if (mousePositionRef.current.length > 0) {
				if (lastMousePositionRef.current) {
					mousePositionRef.current.push(lastMousePositionRef.current); // 마지막 마우스 위치 추가
				}
				if (SocketRef.current) {
					SocketRef.current.emit("mousePosition", mousePositionRef.current);
				}
				mousePositionRef.current = [];
			}
		}, 1000);

		return () => {
			document.removeEventListener("mousemove", mouseMoveHandler);
			clearInterval(interval);
		};
	}, [SocketRef]);
};

export default useMouseData;
