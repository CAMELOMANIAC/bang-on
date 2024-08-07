import { useEffect, useRef } from "react";
import { FaMousePointer } from "react-icons/fa";
import { interpolateData } from "../utils/function/common";
import { useCursorRefArray } from "../utils/store/store";

const Cursor = ({ data, name, className }) => {
    const ref = useRef(null);
    const { cursorRefArray, addCursorRef, removeCursorRef } = useCursorRefArray();

    useEffect(() => {
        const interpolateCoordinateData = interpolateData(data, 60)//끈켜보이지 않도록 위치정보를 60개로 보간
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
    }, [data]);

    //커서 ref를 전역에서 관리하기위해 스토어에 추가합니다.
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

    return (
        <div ref={ref} className={className}>
            <FaMousePointer />
            <p className="cursor_name">{name}</p>
        </div>
    );
};

export default Cursor;