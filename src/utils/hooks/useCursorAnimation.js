import { useEffect, useRef, useState } from "react";
import { isIntersecting } from "../function/common";

const useCursorAnimation = (ref, cursorRefArray, speed, angle, setMouseData) => {
	const [isIntersect, setIsIntersect] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isAvailableAnimation, setIsAvailableAnimation] = useState(false);
	const animationTimer = useRef(null);
	const isAvailableAnimationTimer = useRef(null);

	const [intersectingCursor, setIntersectingCursor] = useState();

	//후크가 언마운트 되면 타이머 제거
	useEffect(() => {
		return () => {
			if (animationTimer.current) {
				clearTimeout(animationTimer.current);
			}
			if (isAvailableAnimationTimer.current) {
				clearTimeout(isAvailableAnimationTimer.current);
			}
		};
	}, []);

	//교차하는지 확인합니다.
	useEffect(() => {
		let isAnyIntersecting = false;
		let intersectingItem = null;
		cursorRefArray &&
			cursorRefArray.forEach((item) => {
				if (item.target === ref.current || !item) return;
				if (isIntersecting(ref.current, item.target) && !item.isAnimating && item.currentSpeed > 1) {
					isAnyIntersecting = true;
					//교차된 아이템을 저장하고 교차된 아이템의 데이터를 수정합니다.
					intersectingItem = item;
					intersectingItem.isAnimating = true;
					setIntersectingCursor(intersectingItem);
				}
			});
		setIsIntersect(isAnyIntersecting);
	}, [cursorRefArray, ref, speed]);

	//교차하면 애니메이션을 실행합니다.
	useEffect(() => {
		if (isIntersect) {
			setIsAnimating(true);
			setMouseData(intersectingCursor);
		}
	}, [intersectingCursor, isIntersect, setMouseData]);

	//애니메이션을 실행합니다.
	useEffect(() => {
		if (isAnimating && !animationTimer.current) {
			animationTimer.current = setTimeout(() => {
				setIsAnimating(false);
				animationTimer.current = null;
				//console.log('애니메이션 종료');
			}, 1500);
			//console.log('애니메이션 시작');
		}
	}, [isAnimating]);

	//속도가 10이상, 좌우로 움직이면 최소 0.3초간 isAvailableAnimation을 true로 설정합니다.
	useEffect(() => {
		if (
			(speed > 10 && ((angle > 135 && angle <= 180) || (angle > -180 && angle < -135))) ||
			(speed > 10 && ((angle > -45 && angle <= 0) || (angle > 0 && angle < 45)))
		) {
			setIsAvailableAnimation(true);
			if (isAvailableAnimationTimer.current) {
				clearTimeout(isAvailableAnimationTimer.current);
				isAvailableAnimationTimer.current = setTimeout(() => {
					setIsAvailableAnimation(false);
					isAvailableAnimationTimer.current = null;
				}, 300);
			} else {
				isAvailableAnimationTimer.current = setTimeout(() => {
					setIsAvailableAnimation(false);
					isAvailableAnimationTimer.current = null;
				}, 300);
			}
		}
	}, [angle, speed]);

	return { isAnimating, isAvailableAnimation };
};

export default useCursorAnimation;
