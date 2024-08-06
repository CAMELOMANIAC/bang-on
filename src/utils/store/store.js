import { create } from "zustand";

// export const useStore = create((set) => ({
// 	bears: 0,
// 	increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
// 	removeAllBears: () => set({ bears: 0 }),
// 	updateBears: (newBears) => set({ bears: newBears })
// }));

export const useSocketClientId = create((set) => ({
	clientId: "",
	setClientId: (newClientId) => set({ clientId: newClientId })
}));
