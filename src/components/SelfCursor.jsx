import { useEffect, useRef, useState } from "react";
import { FaMousePointer } from "react-icons/fa";
import { useCursorRefArray } from "../utils/store/store";

/**
 * 두 엘리먼트가 교차하는지 확인합니다.
 *
 * @param {React.MutableRefObject} element1 
 * @param {React.MutableRefObject} element2
 * @returns {boolean}
 */
function isIntersecting(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

const SelfCursor = ({ className, clientId }) => {
    const [selfMousePos, setSelfMousePos] = useState({ x: 0, y: 0 });
    const ref = useRef(null);
    const { cursorRefArray, addCursorRef, removeCursorRef } = useCursorRefArray();
    const [isIntersect, setIsIntersect] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const animationTimer = useRef(null);

    //커서 ref를 전역에서 관리하기위해 스토어에 추가합니다.(우선 자기자신의 커서는 제외합니다. 나중에 넣을수도 있고...)
    useEffect(() => {
        const currentRef = ref.current;
        if (!cursorRefArray.some(ref => ref === currentRef)) {
            addCursorRef(currentRef);
        }
        return () => {
            removeCursorRef(currentRef);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addCursorRef, removeCursorRef]);

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
        }
    }, [])

    //실제 커서 위치로 렌더링합니다.
    useEffect(() => {
        if (ref.current && !isAnimating) {
            ref.current.style.left = selfMousePos.x + "px";
            ref.current.style.top = selfMousePos.y + "px";
            ref.current.style.color = 'orange';
            ref.current.style.position = 'absolute';
        }
    }, [ref, selfMousePos, isAnimating])

    //요소가 교차하는지 확인합니다.
    useEffect(() => {
        let isAnyIntersecting = false;
        cursorRefArray && cursorRefArray.forEach(item => {
            if (item === ref.current) return;
            if (isIntersecting(ref.current, item)) {
                isAnyIntersecting = true;
            }
        })
        setIsIntersect(isAnyIntersecting);
    }, [cursorRefArray, selfMousePos.x, selfMousePos.y])

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

    return (
        <div ref={ref}>
            {isAnimating ? <iframe
                title="giphy"
                src="https://giphy.com/embed/SySzx1gMQwpdq4DM54"
                frameBorder="0"
                className="giphy-embed"
                allowFullScreen
            ></iframe> : <><FaMousePointer />
                <p className="cursor_name">{clientId}</p>
            </>}

        </div>
    );
};

export default SelfCursor;