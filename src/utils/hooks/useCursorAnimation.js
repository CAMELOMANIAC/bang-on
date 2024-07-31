import { useEffect, useRef } from "react";

/**
 * 마우스 커서 애니메이션 훅
 *
 * @param {{ coordinates: any[][]; elements: HTMLElement[]; }}
 * @argument {Array} coordinates - 마우스 좌표 배열의 배열
 * @argument {Array} elements - 애니메이션을 적용할 요소 배열
 */
const useCursorAnimation = ({ coordinates, elements }) => {
	const lastMousePositionRef = useRef(null); // 마지막 마우스 위치를 추적하는 변수
	useEffect(() => {
		let coordinateEndTime;
		const coordinateArrays = coordinates.map((coordinateSet) => {
			let coordinateStartTime;
			return coordinateSet[1].map((item, index) => {
				if (coordinateStartTime === undefined) coordinateStartTime = item.time;
				if (index === coordinateSet[1].length - 1) coordinateEndTime = item.time - coordinateStartTime;
				return {
					x: item.x,
					y: item.y,
					time: item.time - coordinateStartTime
				};
			});
		});

		const animate = (timestamp) => {
			let allAnimationsCompleted = true; // 모든 애니메이션이 완료되었는지 확인하는 플래그

			elements.forEach((element, index) => {
				const coordinateArray = coordinateArrays[index];
				let start = element.dataset.start ? parseFloat(element.dataset.start) : undefined;
				if (start === undefined) {
					start = timestamp;
					element.dataset.start = start;
				}
				const elapsed = timestamp - start;
				//console.log(elapsed < coordinateEndTime);
				if (elapsed < coordinateEndTime) {
					//애니메이션 경과시간이 마지막 좌표의 시간보다 작을때만 애니메이션을 진행합니다.
					allAnimationsCompleted = false;

					const currentCoordinate = coordinateArray?.find((item) => item.time >= elapsed);
					if (element) {
						if (currentCoordinate) {
							element.style.left = `${currentCoordinate.x}px`;
							element.style.top = `${currentCoordinate.y}px`;
							lastMousePositionRef.current = { x: currentCoordinate.x, y: currentCoordinate.y };
						} else if (lastMousePositionRef.current) {
							//가끔 마지막 좌표가 없을때가 있어서 되돌아가지 않도록 이전 좌표를 사용합니다.
							element.style.left = `${lastMousePositionRef.current.x}px`;
							element.style.top = `${lastMousePositionRef.current.y}px`;
						}
					}
				}
			});
			if (!allAnimationsCompleted) {
				requestAnimationFrame(animate); // 애니메이션이 완료되지 않았으면 다시 호출
			}
		};

		requestAnimationFrame(animate);
	}, [coordinates, elements]);
};

export default useCursorAnimation;
