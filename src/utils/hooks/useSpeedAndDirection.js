import { useEffect, useRef, useState } from "react";

/**
 * ref의 style의 변경을 감지해서 커서의 속도와 방향을 계산합니다.
 *
 * @param {React.MutableRefObject} ref - 변경을 감지할 ref
 * @returns {Object} 객체형태로 속도와 방향을 반환합니다.
 * @returns {number} speed - 속도
 * @returns {number} angle - 방향(각도)
 */
const useSpeedAndDirection = (ref) => {
	const [currPos, setCurrPos] = useState({ x: 0, y: 0 });
	const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });
	const [speed, setSpeed] = useState(0);
	const [angle, setAngle] = useState(0);
	const timer = useRef(null);

	//커서위치 상태를 업데이트합니다.
	useEffect(() => {
		const observer = new MutationObserver((mutationsList) => {
			for (const mutation of mutationsList) {
				if (mutation.type === "attributes" && mutation.attributeName === "style") {
					const targetElement = mutation.target;
					const left = parseFloat(targetElement.style.left);
					const top = parseFloat(targetElement.style.top);
					setCurrPos({ x: left, y: top });
				}
			}
		});

		observer.observe(ref.current, { attributes: true, attributeFilter: ["style"] });

		return () => {
			observer.disconnect();
		};
	}, [ref]);

	useEffect(() => {
		const timediff = 1;
		if (currPos && prevPos) {
			// 거리 계산
			const distance = Math.sqrt((currPos.x - prevPos.x) ** 2 + (currPos.y - prevPos.y) ** 2);

			// 속도 계산
			const speed = distance / timediff;
			setSpeed(speed);

			// 방향(각도) 계산
			const deltaX = currPos.x - prevPos.x;
			const deltaY = currPos.y - prevPos.y;
			const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // 라디안 -> 도(degree) 변환
			//console.log(angle > 45 && angle < 135 ? "아래" : (angle > 135 && angle < 180) || (angle > -180 && angle < -135) ? "왼쪽" : angle > -135 && angle < -45 ? "위" : "오른쪽");
			setAngle(angle);

			if (!timer.current) {
				timer.current = setTimeout(() => {
					setSpeed(0);
					setAngle(0);
					timer.current = null;
				}, 200);
			} else {
				clearTimeout(timer.current);
				timer.current = setTimeout(() => {
					setSpeed(0);
					setAngle(0);
					timer.current = null;
				}, 200);
			}
		}
		setPrevPos(currPos);

		return () => {
			if (timer.current) {
				clearTimeout(timer.current);
			}
		};
	}, [currPos.x, currPos.y]); //eslint-disable-line react-hooks/exhaustive-deps

	return { speed, angle };
};

export default useSpeedAndDirection;
