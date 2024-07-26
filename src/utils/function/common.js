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
 * @param {string} storageKey - 로컬 스토리지에서 값을 가져올 때 사용할 키.
 * @returns {string[]|[]} 로컬 스토리지에 저장된 스트리머 구독 정보의 배열.
 */
export const getLocalStorageToArray = (storageKey) => {
	//로컬스토리지의 스트리머 구독 정보를 가져옴
	const subscribedChannel = [];
	for (let key in localStorage) {
		const value = localStorage.getItem(key);
		if (value === null) continue;
		const parsedValue = JSON.parse(value);
		if (parsedValue) {
			subscribedChannel.push(parsedValue[storageKey]);
		}
	}
	return subscribedChannel;
};

/**
 * 중복제거 및 liveTitle이 있는 아이템을 우선적으로 선택하는 함수
 *
 * @param {Object[]} items - 필터링할 객체 배열
 * @param {string} uniqueKey - 중복을 제거할 기준이 되는 키
 * @param {string} priorityKey - 우선적으로 선택할 아이템을 판단하는 키
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

/**
 * 원형큐를 구현하기 위한 클래스입니다.
 *
 * @export
 * @class CircleQueue
 * @constructor
 * @param {number} size 큐의 크기
 * @example const queue = new CircleQueue(5);
 */
export class CircleQueue {
	constructor(size) {
		this.arr = new Array(size);
		this.tailIndex = 0;
		this.headIndex = 0;
		this.size = size;
	}

	/**
	 * 큐에 아이템을 추가합니다.
	 *
	 * @param {*} item
	 */
	enqueue(item) {
		if (this.isFull()) {
			this.headIndex = (this.headIndex + 1) % this.arr.length; // 가장 오래된 항목을 덮어씀
		}
		this.arr[this.tailIndex] = item;
		this.tailIndex = (this.tailIndex + 1) % this.size;
	}

	/**
	 * 큐에서 아이템을 제거하고 반환합니다.
	 *
	 * @throws {Error} 큐가 비어있을 때 발생합니다.
	 * @returns {*}
	 */
	dequeue() {
		if (this.isEmpty()) {
			throw new Error("Queue is empty");
		}
		const item = this.arr[this.headIndex];
		this.arr[this.headIndex] = null; // Clear the slot
		this.headIndex = (this.headIndex + 1) % this.size;
		return item;
	}

	/**
	 * 큐의 첫 번째 아이템을 반환합니다(제거하지 않고 값만 반환합니다).
	 *
	 * @readonly
	 * @returns {*}
	 */
	get peek() {
		if (this.isEmpty()) {
			throw new Error("Queue is empty");
		}
		return this.arr[this.headIndex];
	}

	/**
	 * 큐의 모든 아이템을 반환합니다.
	 *
	 * @readonly
	 * @type {Array}
	 */
	get list() {
		const result = [];
		for (let i = 0; i < this.size; i++) {
			const index = (this.headIndex + i) % this.size;
			if (this.arr[index] !== null) {
				result.push(this.arr[index]);
			}
		}
		return result;
	}

	isEmpty() {
		return this.headIndex === this.tailIndex && !this.arr[this.headIndex];
	}

	isFull() {
		return this.headIndex === this.tailIndex && !!this.arr[this.headIndex];
	}
}
