import { useEffect, useRef } from "react";
import { FaMousePointer } from "react-icons/fa";

const Cursor = ({ data, name, className }) => {
    const ref = useRef(null);

    useEffect(() => {
        let startTime;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            const currentCoordinate = data.find((item) => item.time - data[0].time >= elapsed);
            //console.log(elapsed, timestamp, startTime);
            if (!(ref.current)) return;

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