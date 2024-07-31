import { forwardRef } from "react";
import { FaMousePointer } from "react-icons/fa";

const Cursor = forwardRef(({ className, user }, ref) => {
    // const ref = useRef(null);
    // useCursorAnimation({ coordinates: item[1], element: ref.current });

    return (
        <div
            className={className}
            ref={ref}>
            <FaMousePointer />
            {user}
        </div>
    );
});

export default Cursor;