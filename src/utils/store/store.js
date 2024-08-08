import { create } from "zustand";

// export const useStore = create((set) => ({
// 	bears: 0,
// 	increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
// 	removeAllBears: () => set({ bears: 0 }),
// 	updateBears: (newBears) => set({ bears: newBears })
// }));

/**
 * 소켓서버에서 사용하는 자기 자신의 아이디를 관리하는 store
 *
 * @type {*}
 */
export const useSocketClientId = create((set) => ({
	clientId: "",
	setClientId: (newClientId) => set({ clientId: newClientId })
}));

/**
 * 커서의 ref를 전역에서 관리하기 위한 store
 * @typedef {Object} MouseDataType
 * @property {HTMLElement} target - 위치를 추적할 dom
 * @property {boolean} isAnimating - 애니메이션 재생 여부
 * @property {number} currentSpeed - 현재 속도
 */
export const useMouseDataStore = create((set, get) => ({
	/**
	 * 마우스 데이터 Map
	 * @type {Map<HTMLElement, MouseDataType>}
	 */
	mouseData: new Map(),
	/**
	 * 마우스 데이터 Map에 새로운 마우스 데이터를 추가하거나 업데이트합니다.
	 * @param {MouseDataType} newMouseData - 새로운 마우스 데이터
	 */
	setMouseData: (newMouseData) =>
		set((state) => {
			const newMouseDataMap = new Map(state.mouseData);
			newMouseDataMap.set(newMouseData.target, newMouseData);
			//console.log(newMouseDataMap);
			return { mouseData: newMouseDataMap };
		}),
	/**
	 * 저장 되어있는 Map에서 특정 HTMLElement를 가진 마우스 데이터를 제거합니다.
	 * @param {HTMLElement} key - 제거할 마우스 데이터의 HTMLElement형태의 키
	 */
	deleteMouseData: (key) =>
		set((state) => {
			const newMouseDataMap = new Map(state.mouseData);
			newMouseDataMap.delete(key);
			return { mouseData: newMouseDataMap };
		}),
	/**
	 * mouseData를 일반 객체로 변환하여 반환합니다.
	 * @returns {Object} 마우스 데이터 객체
	 */
	getMouseDataAsObject: () => {
		const mouseDataMap = get().mouseData;
		const mouseDataArray = [];
		mouseDataMap.forEach((value) => {
			mouseDataArray.push(value);
		});
		return mouseDataArray;
	}
}));
