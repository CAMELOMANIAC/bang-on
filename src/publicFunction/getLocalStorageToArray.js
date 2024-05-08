/**
 * 로컬 스토리지에서 스트리머 구독 정보를 가져와서 배열로 반환하는 함수입니다.
 * 각 키에 대해 로컬 스토리지에서 값을 가져오고, 이 값을 JSON으로 파싱합니다.
 * 파싱된 값이 존재하면, 이 값을 `subscribedChannel` 배열에 추가합니다.
 *
 * @returns {string[]} 로컬 스토리지에 저장된 스트리머 구독 정보의 배열. 각 요소는 스트리머의 채널 이름입니다.
 */
export const getLocalStorageToArray = () => {
	//로컬스토리지의 스트리머 구독 정보를 가져옴
	const subscribedChannel = [];
	for (let key in localStorage) {
		const value = localStorage.getItem(key);
		const parsedValue = JSON.parse(value);
		if (parsedValue) {
			subscribedChannel.push(parsedValue.channelName);
		}
	}
	return subscribedChannel;
};
