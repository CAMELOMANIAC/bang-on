import { useEffect, useRef } from "react";
import { FaMousePointer } from "react-icons/fa";
import { interpolateData } from "../utils/function/common";

const Cursor = ({ data, name, className }) => {
    const ref = useRef(null);

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

    return (
        <div ref={ref} className={className}>
            <FaMousePointer />
            {name}
        </div>
    );
};

export default Cursor;