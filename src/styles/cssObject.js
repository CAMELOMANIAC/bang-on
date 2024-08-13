/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

export const rotatingStyle = (angle, speed) => {
	const speedRatio = Math.min(speed / 5, 1);
	const directionToAdjust = () => {
		if (angle >= 0 && angle < 180) {
			return -50 * speedRatio;
		} else {
			return 50 * speedRatio;
		}
	};
	return css`
		transform: rotate(${directionToAdjust()}deg);
	`;
};
