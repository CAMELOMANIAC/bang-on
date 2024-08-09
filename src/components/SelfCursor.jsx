import { useEffect, useRef, useState } from "react";
import { FaMousePointer } from "react-icons/fa";
import { useMouseDataStore } from "../utils/store/store";
import { isIntersecting } from "../utils/function/common";
import { HiOutlineHandRaised } from "react-icons/hi2";
import useSpeedAndDirection from '../utils/hooks/useSpeedAndDirection';


const SelfCursor = ({ className, clientId }) => {
    const [selfMousePos, setSelfMousePos] = useState({ x: 0, y: 0 });
    const ref = useRef(null);
    const { getMouseDataAsObject } = useMouseDataStore();
    const [isIntersect, setIsIntersect] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const animationTimer = useRef(null);
    const [isAvailableAnimation, setIsAvailableAnimation] = useState(false);
    const isAvailableAnimationTimer = useRef(null);
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
            if (animationTimer.current) {
                clearTimeout(animationTimer.current);
            }
            if (isAvailableAnimationTimer.current) {
                clearTimeout(isAvailableAnimationTimer.current);
            }
        }
    }, [])//eslint-disable-line react-hooks/exhaustive-deps

    //실제 커서 위치로 렌더링합니다.
    useEffect(() => {
        if (ref.current && !isAnimating) {
            ref.current.style.left = selfMousePos.x + "px";
            ref.current.style.top = selfMousePos.y + "px";
            ref.current.style.color = 'orange';
            ref.current.style.position = 'absolute';
        }
    }, [ref, selfMousePos, isAnimating])

    //교차하는지 확인합니다.
    useEffect(() => {
        let isAnyIntersecting = false;
        const cursorRefArray = getMouseDataAsObject();
        cursorRefArray && cursorRefArray.forEach(item => {
            if (item === ref.current || !item) return;
            if (isIntersecting(ref.current, item.target) && !item.isAnimating && item.currentSpeed > 1) {
                isAnyIntersecting = true;
            }
        })
        setIsIntersect(isAnyIntersecting);
    }, [getMouseDataAsObject, selfMousePos.x, selfMousePos.y])

    //교차하면 애니메이션을 실행합니다.
    useEffect(() => {
        if (isIntersect) {
            setIsAnimating(true);
        }
    }, [isIntersect])

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
    }, [isAnimating])

    //속도가 10이상, 좌우로 움직이면 최소 0.3초간 isAvailableAnimation을 true로 설정합니다.
    useEffect(() => {
        if ((speed > 10 && ((angle > 135 && angle < 180) || (angle > -180 && angle < -135)))
            || (speed > 10 && ((angle > -45 && angle < 0) || (angle > 0 && angle < 45)))) {
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
    }, [angle, speed])

    return (
        <div ref={ref}>
            {isAnimating ? <iframe
                title="giphy"
                src="https://giphy.com/embed/SySzx1gMQwpdq4DM54"
                frameBorder="0"
                className="giphy-embed"
                allowFullScreen
            ></iframe> : isAvailableAnimation ? <HiOutlineHandRaised />
                : <>
                    <FaMousePointer />
                    <p className="cursor_name">{clientId}</p>
                </>}
        </div>
    );
};

export default SelfCursor;