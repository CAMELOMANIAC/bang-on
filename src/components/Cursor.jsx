import { useEffect, useRef } from "react";
import { FaMousePointer } from "react-icons/fa";
import { interpolateData } from "../utils/function/common";
import { useMouseDataStore } from "../utils/store/store";
import { HiOutlineHandRaised } from "react-icons/hi2";
import useSpeedAndDirection from "../utils/hooks/useSpeedAndDirection";

const Cursor = ({ data, name, className }) => {
    const ref = useRef(null);
    const { setMouseData, deleteMouseData } = useMouseDataStore();
    const { speed } = useSpeedAndDirection(ref);

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

    //커서 ref를 전역에서 관리하기위해 스토어에 추가합니다.
    useEffect(() => {
        const refCurrent = ref.current;
        const mouseData = {
            target: refCurrent,
            isAnimating: false,
            currentSpeed: speed
        }
        setMouseData(mouseData);

        return () => {
            deleteMouseData(refCurrent);
        }
    }, [speed]);//eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div ref={ref} className={`${className} ${(speed > 4.5 && "cursor_move")}`}>
            {speed > 4 ? <HiOutlineHandRaised /> : <FaMousePointer />}
            <p className="cursor_name">{name}[{speed}]</p>
        </div>
    );
};

export default Cursor;