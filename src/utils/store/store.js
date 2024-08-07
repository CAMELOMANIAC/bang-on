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
 * 커서 ref를 관리하는 store
 */
export const useCursorRefArray = create((set) => ({
	/**
	 * 커서 ref 배열
	 * @type {Array}
	 */
	cursorRefArray: [],
	/**
	 * 배열을 새로운 배열로 교체합니다.
	 * @param {Array} newCursorRefArray
	 * @returns
	 */
	setCursorRefArray: (newCursorRefArray) => set({ cursorRefArray: newCursorRefArray }),
	/**
	 * 새로운 커서 ref를 추가합니다.
	 * @param {*} newCursorRef
	 * @returns
	 */
	addCursorRef: (newCursorRef) => set((state) => ({ cursorRefArray: [...state.cursorRefArray, newCursorRef] })),
	/**
	 * 커서 ref를 제거합니다.
	 * @param {*} cursorRef
	 * @returns
	 */
	removeCursorRef: (cursorRef) =>
		set((state) => ({ cursorRefArray: state.cursorRefArray.filter((item) => item !== cursorRef) }))
}));
