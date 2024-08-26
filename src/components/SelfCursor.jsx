/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from "react";
import { useMouseDataStore } from "../utils/store/store";
import useSpeedAndDirection from '../utils/hooks/useSpeedAndDirection';
import useCursorAnimation from "../utils/hooks/useCursorAnimation";
import { HiOutlineHandRaised } from "react-icons/hi2";
import { rotatingStyle } from "../styles/cssObject";

const SelfCursor = ({ className, clientId }) => {
    const [selfMousePos, setSelfMousePos] = useState({ x: 0, y: 0 });
    const ref = useRef(null);
    const { getMouseDataAsObject, setMouseData } = useMouseDataStore();
    const { speed, angle } = useSpeedAndDirection(ref)

    // //커서 ref를 전역에서 관리하기위해 스토어에 추가합니다.(우선 자기자신의 커서는 제외합니다. 나중에 넣을수도 있고...)
    // useEffect(() => {
    //     const currentRef = ref.current;
    //     if (!cursorRefArray.some(ref => ref === currentRef)) {
    //         addCursorRef(currentRef);
    //     }
    //     return () => {
    //         removeCursorRef(currentRef);
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [addCursorRef, removeCursorRef]);

    //커서위치 상태를 업데이트합니다.
    useEffect(() => {
        const mouseMoveHandler = (event) => {
            setSelfMousePos({ x: event.pageX, y: event.pageY })
        }
        document.addEventListener("mousemove", mouseMoveHandler)
        return () => {
            document.removeEventListener("mousemove", mouseMoveHandler)
        }
    }, [])//eslint-disable-line react-hooks/exhaustive-deps

    const cursorRefArray = getMouseDataAsObject();
    //커서 애니메이션 실행을 결정합니다.
    const { isAnimating, isAvailableAnimation } = useCursorAnimation(ref, cursorRefArray, speed, angle, setMouseData);

    //실제 커서 위치로 렌더링합니다.
    useEffect(() => {
        if (ref.current && !isAnimating) {
            ref.current.style.left = selfMousePos.x + "px";
            ref.current.style.top = selfMousePos.y + "px";
            ref.current.style.color = 'orange';
            ref.current.style.position = 'absolute';
        }
    }, [ref, selfMousePos, isAnimating])

    useEffect(() => {
        if (isAvailableAnimation) {
            document.body.style.cursor = 'none';
        } else {
            document.body.style.cursor = 'auto';
        }
    }, [isAvailableAnimation])

    return (
        <div
            ref={ref}
            className={`${className} ${isAvailableAnimation && 'cursor_move'}`}
        >
            {isAnimating ? <iframe
                title="giphy"
                src="https://giphy.com/embed/SySzx1gMQwpdq4DM54"
                frameBorder="0"
                className="giphy-embed"
                allowFullScreen
            ></iframe> : isAvailableAnimation ? <HiOutlineHandRaised css={rotatingStyle(angle, speed)} />
                :
                <p className="cursor_name">{clientId}</p>}
        </div>
    );
};

export default SelfCursor;