//@ts-check
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 쿼리 로딩과 애니메이션을 관리하는 훅입니다.
 *
 * @param {{ current: HTMLInputElement | null }} searchContainerRef - 검색 결과를 감싸는 컨테이너의 ref 객체입니다.
 * @param {{ current: HTMLInputElement | null }} inputRef - 검색어 input 요소의 ref 객체입니다.
 * @param {boolean} isSuccess - 쿼리 결과가 성공적인지 여부입니다.
 * @returns {{ onClickHandler: () => void; isLoading: boolean}} - 클릭 이벤트 핸들러와 로딩 상태값을 반환합니다.
 */
const useQueryLoading = (searchContainerRef, inputRef, isSuccess) => {
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const onClickHandler = () => {
		setIsLoading(true);
		if (searchContainerRef.current) {
			searchContainerRef.current.style.maxHeight = "60vw";
		}
		if (searchContainerRef.current) {
			searchContainerRef.current.classList.add("turn-off-anim");
			searchContainerRef.current.classList.remove("turn-on-anim");
		}
	};

	/** @type {{ current: NodeJS.Timeout | null }} */
	const timer = useRef(null);
	useEffect(() => {
		if (isLoading) {
			timer.current = setTimeout(() => {
				// 타이머 로직
				setIsLoading(false);
				navigate("?search=" + (inputRef.current && inputRef.current.value), { relative: "path" });
				//setInputValue((prev) => (inputRef.current ? inputRef.current.value : prev));
				if (searchContainerRef.current) {
					searchContainerRef.current.style.maxHeight = "none";
				}
			}, 300);
		}

		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (searchContainerRef.current && isSuccess && !isLoading) {
			searchContainerRef.current.classList.add("turn-on-anim");
			searchContainerRef.current.classList.remove("turn-off-anim");
		}
	}, [isSuccess, searchContainerRef.current, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

	return { onClickHandler, isLoading };
};

export default useQueryLoading;
