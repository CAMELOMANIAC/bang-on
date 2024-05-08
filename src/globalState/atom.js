import { atom } from "recoil";

export const showLiveState = atom({
	key: "showLiveState",
	default: false
});

export const searchTypeState = atom({
	key: "searchTypeState",
	default: "channelName"
});

export const steamingServiceState = atom({
	key: "steamingServiceState",
	default: ["chzzk", "afreeca"]
});

export const subscribedChannelState = atom({
	key: "subscribedChannelState",
	default: []
});
