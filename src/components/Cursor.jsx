/** @jsxImportSource @emotion/react */
import { useEffect, useRef } from "react";
import { FaMousePointer } from "react-icons/fa";
import { interpolateData } from "../utils/function/common";
import { useMouseDataStore } from "../utils/store/store";
import { HiOutlineHandRaised } from "react-icons/hi2";
import useSpeedAndDirection from "../utils/hooks/useSpeedAndDirection";
import useCursorAnimation from "../utils/hooks/useCursorAnimation";
import { rotatingStyle } from "../styles/cssObject";

const Cursor = ({ data, name, className }) => {
    const ref = useRef(null);
    const { setMouseData, deleteMouseData, getMouseDataAsObject } = useMouseDataStore();
    const { speed, angle } = useSpeedAndDirection(ref);

    useEffect(() => {
        const interpolateCoordinateData = interpolateData(data, 60)//끊켜보이지 않도록 위치정보를 60개로 보간

        let startTime;
        const animate = (timestamp) => {
            if (!(ref.current)) return;
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const currentCoordinate = interpolateCoordinateData.find((item) => item.time - interpolateCoordinateData[0].time >= elapsed);
            //console.log(elapsed, timestamp, startTime);

            if (currentCoordinate) {
                ref.current.style.left = `${currentCoordinate.x}px`;
                ref.current.style.top = `${currentCoordinate.y}px`;

            }
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(animate);
        }
    }, [data]);//eslint-disable-line react-hooks/exhaustive-deps

    const cursorRefArray = getMouseDataAsObject();
    const { isAnimating, isAvailableAnimation } = useCursorAnimation(ref, cursorRefArray, speed, angle, setMouseData);

    //커서 ref를 전역에서 관리하기위해 스토어에 추가합니다.
    useEffect(() => {
        const refCurrent = ref.current;
        const mouseData = {
            target: refCurrent,
            isAnimating: isAnimating,
            currentSpeed: speed
        }
        setMouseData(mouseData);

        return () => {
            deleteMouseData(refCurrent);
        }
    }, [speed]);//eslint-disable-line react-hooks/exhaustive-deps

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
                : <>
                    <FaMousePointer />
                    <p className="cursor_name">{name}</p>
                </>}
        </div>
    );
};

export default Cursor;