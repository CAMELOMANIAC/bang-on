//@ts-check

/**
 * JSONP 형식의 문자열을 JSON 형식으로 변환하는 함수입니다.
 * @param {string} jsonp JSONP 형식의 문자열.
 * @returns {string} JSONP 형식의 문자열을 JSON 형식으로 변환한 문자열.
 */
export const convertJSONPToJSON = (jsonp) => {
	return jsonp.replace(/^[^(]+\((.*)\)$/, "$1");
};

/**
 * 로컬 스토리지에서 스트리머 구독 정보를 가져와서 배열로 반환하는 함수입니다.
 * 각 키에 대해 로컬 스토리지에서 값을 가져오고, 이 값을 JSON으로 파싱합니다.
 * 파싱된 값이 존재하면, 이 값을 `subscribedChannel` 배열에 추가합니다.
 *
 * @returns {string[]|[]} 로컬 스토리지에 저장된 스트리머 구독 정보의 배열.
 */
export const getLocalStorageToArray = () => {
	//로컬스토리지의 스트리머 구독 정보를 가져옴
	const subscribedChannel = [];
	for (let key in localStorage) {
		const value = localStorage.getItem(key);
		if (value === null) continue;
		const parsedValue = JSON.parse(value);
		if (parsedValue) {
			subscribedChannel.push(parsedValue.id);
		}
	}
	return subscribedChannel;
};

/**
 * 중복제거 및 liveTitle이 있는 아이템을 우선적으로 선택하는 함수
 *
 * @param {Object[]} items - 필터링할 객체 배열
 * @param {string} items[].uniqueKey - 중복을 제거할 기준이 되는 키
 * @param {string} items[].priorityKey - 우선적으로 선택할 아이템을 판단하는 키
 * @returns {Object[]} - 중복된 아이템을 제거한 배열
 */
export const filterUniqueItemsWithPriority = (items, uniqueKey, priorityKey) => {
	const itemsMap = new Map();

	items.forEach((item) => {
		const existingItem = itemsMap.get(item[uniqueKey]);
		// 새 아이템에 liveTitle이 있거나 기존 아이템이 없는 경우, 아이템을 Map에 추가/업데이트합니다.
		if (!existingItem || (item[priorityKey] && !existingItem[priorityKey])) {
			itemsMap.set(item[uniqueKey], item);
		}
	});

	// Map의 값들만 추출하여 배열로 반환합니다.
	return Array.from(itemsMap.values());
};
