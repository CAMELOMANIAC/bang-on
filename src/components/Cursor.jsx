import { useEffect, useRef, useState } from "react";
import { FaMousePointer } from "react-icons/fa";
import { interpolateData } from "../utils/function/common";
import { useMouseDataStore } from "../utils/store/store";
import { HiOutlineHandRaised } from "react-icons/hi2";

const Cursor = ({ data, name, className }) => {
    const ref = useRef(null);
    const { setMouseData, deleteMouseData } = useMouseDataStore();
    const [speed, setSpeed] = useState(0);
    const [angle, setAngle] = useState(0);

    useEffect(() => {
        const interpolateCoordinateData = interpolateData(data, 60)//끊켜보이지 않도록 위치정보를 60개로 보간
        //속도계산을 위한 변수
        let currPos = null;
        let prevPos = null;
        const timeDiff = 1;

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

                currPos = { x: currentCoordinate.x, y: currentCoordinate.y };
                if (currPos && prevPos) {
                    // 거리 계산
                    const distance = Math.sqrt((currPos.x - prevPos.x) ** 2 + (currPos.y - prevPos.y) ** 2);

                    // 속도 계산
                    const speed = distance / timeDiff;
                    setSpeed(speed);

                    // 방향(각도) 계산
                    const deltaX = currPos.x - prevPos.x;
                    const deltaY = currPos.y - prevPos.y;
                    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // 라디안 -> 도(degree) 변환
                    //console.log(angle > 45 && angle < 135 ? "아래" : (angle > 135 && angle < 180) || (angle > -180 && angle < -135) ? "왼쪽" : angle > -135 && angle < -45 ? "위" : "오른쪽");
                    setAngle(angle);
                }
                prevPos = currPos;
            } else {
                // 애니메이션이 멈췄을 때 speed를 0으로 설정
                setSpeed(0);
                setAngle(angle);
            }
            requestAnimationFrame(animate);
        }

        // 애니메이션이 멈췄을 때 speed를 0으로 설정
        setSpeed(0);
        setAngle(angle);

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

    // useEffect(() => {
    //     console.log(getMouseDataAsObject());
    // }, [getMouseDataAsObject, mouseData]);

    return (
        <div ref={ref} className={`${className} ${(speed > 4.5 && "cursor_move")}`}>
            {speed > 4 ? <HiOutlineHandRaised /> : <FaMousePointer />}
            <p className="cursor_name">{name}[{speed}]</p>
        </div>
    );
};

export default Cursor;