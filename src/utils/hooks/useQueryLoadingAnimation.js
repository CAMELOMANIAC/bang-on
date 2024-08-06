import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * 검색결과의 애니메이션을 관리하는 커스텀 후크
 *
 * @param {boolean} isSuccess - query검색완료여부
 * @param {*} targetRef - 애니메이션을 적용할 검색결과 컨테이너
 */
const useQueryLoadingAnimation = (isSuccess, targetRef) => {
	const location = useLocation();
	const [isAnimating, setIsAnimating] = useState(false);
	const timer = useRef(null);

	//검색어 변경감지
	useEffect(() => {
		setIsAnimating(true);
	}, [location.search]);

	//애니메이션 종료타이머 실행
	useEffect(() => {
		if (isAnimating) {
			timer.current = setTimeout(() => setIsAnimating(false), 300);
		}
		return () => {
			timer.current && clearTimeout(timer.current);
		};
	}, [isAnimating]);

	//애니메이션 실행 클래스 부착
	useEffect(() => {
		if (targetRef.current && isAnimating) {
			targetRef.current.classList.add("turn-off-anim");
			targetRef.current.classList.remove("turn-on-anim");
		}
		if (targetRef.current && !isAnimating && isSuccess) {
			targetRef.current.classList.remove("turn-off-anim");
			targetRef.current.classList.add("turn-on-anim");
		}
	}, [targetRef, isAnimating, isSuccess]);
};

export default useQueryLoadingAnimation;
