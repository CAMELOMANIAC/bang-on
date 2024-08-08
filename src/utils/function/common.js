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
		this.size = size;
		this.queue = new Array(size);
		this.head = 0;
		this.tail = 0;
		this.length = 0;
		this.state = []; // 큐의 상태를 저장할 배열
	}

	/**
	 * 큐에 아이템을 추가합니다.
	 * 만약 큐가 가득차면 첫번째 인덱스부터 다시 채웁니다.
	 *
	 * @param {*} item
	 */
	enqueue(item) {
		if (this.length === this.size) {
			// 큐가 꽉 찼을 때 가장 오래된 요소를 덮어쓰기
			this.head = (this.head + 1) % this.size;
		} else {
			this.length++;
		}
		this.queue[this.tail] = item;
		this.tail = (this.tail + 1) % this.size;
		this._updateState(); // 상태 업데이트
	}

	/**
	 * 큐에서 아이템을 제거하고 반환합니다.
	 * 큐가 비어있으면 에러를 발생시킵니다.
	 *
	 * @throws {Error} 큐가 비어있을 때 발생합니다.
	 * @returns {*}
	 */
	dequeue() {
		if (this.length === 0) {
			throw new Error("Queue is empty");
		}
		const item = this.queue[this.head];
		this.head = (this.head + 1) % this.size;
		this.length--;
		this._updateState(); // 상태 업데이트
		return item;
	}

	/**
	 * 큐의 상태를 미리 업데이트합니다.
	 */
	_updateState() {
		this.state = [];
		for (let i = 0; i < this.length; i++) {
			this.state.push(this.queue[(this.head + i) % this.size]);
		}
	}

	/**
	 * 큐의 모든 아이템을 반환합니다.
	 *
	 * @readonly
	 * @type {Array}
	 */
	get list() {
		return this.state; // O(1) 시간 복잡도로 상태 반환
	}
}
/**
 * @typedef {Object} MouseCoordinateDataType
 * @property {number} x - x 좌표
 * @property {number} y - y 좌표
 * @property {number} time - 시간
 */

/**
 * 데이터를 보간하는 함수입니다.
 *
 * @param {MouseCoordinateDataType[]} data - 원본 데이터
 * @param {*} targetLength - 보간을 원하는 데이터의 길이
 * @returns {{}}
 */
export const interpolateData = (data, targetLength) => {
	const interpolatedData = [];
	const step = (data.length - 1) / (targetLength - 1);

	for (let i = 0; i < targetLength; i++) {
		const index = i * step;
		const lowerIndex = Math.floor(index);
		const upperIndex = Math.ceil(index);
		const t = index - lowerIndex;

		const interpolatedX = data[lowerIndex].x * (1 - t) + data[upperIndex].x * t;
		const interpolatedY = data[lowerIndex].y * (1 - t) + data[upperIndex].y * t;
		const interpolatedTime = data[lowerIndex].time * (1 - t) + data[upperIndex].time * t;

		interpolatedData.push({ x: interpolatedX, y: interpolatedY, time: interpolatedTime });
	}

	return interpolatedData;
};

/**
 * 데이터 배열에서 거리를 계산하는 함수입니다.
 *
 * @param {MouseCoordinateDataType[]} data - 데이터 배열
 * @returns {number[]} - 거리 배열
 */
export const calculateDistance = (data) => {
	const speeds = [];

	for (let i = 1; i < data.length; i++) {
		const prev = data[i - 1];
		const curr = data[i];

		const timeDiff = (curr.time - prev.time) / 1000; // 시간 차이를 초 단위로 변환
		const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)); // 유클리드 거리 계산

		const speed = distance / timeDiff; // 속도 계산
		speeds.push(Number.isNaN(speed) ? 0 : speed);
	}

	return speeds;
};

/**
 * 두 엘리먼트가 교차하는지 확인합니다.
 *
 * @param {HTMLElement} element1
 * @param {HTMLElement} element2
 * @returns {boolean}
 */
export const isIntersecting = (element1, element2) => {
	if (!element1 || !element2) return false;
	const rect1 = element1.getBoundingClientRect();
	const rect2 = element2.getBoundingClientRect();

	return !(
		rect1.right < rect2.left ||
		rect1.left > rect2.right ||
		rect1.bottom < rect2.top ||
		rect1.top > rect2.bottom
	);
};
