//@ts-check
import "../styles/App.css";
import { useEffect, useMemo, useRef, useState } from "react";
import useGetLiveChannelData from "../utils/hooks/useGetLiveChannelData.js";
import ChannelCard from "../components/ChannelCard.jsx";
import React from "react";

/**
 * 중복제거 및 liveTitle이 있는 아이템을 우선적으로 선택하는 함수
 *
 * @param {*} items - 필터링할 객체 배열
 * @returns {*} - 중복된 아이템을 제거한 배열
 */
function filterUniqueItemsWithPriority(items) {
	const itemsMap = new Map();

	items.forEach((item) => {
		const existingItem = itemsMap.get(item.id);
		// 새 아이템에 liveTitle이 있거나 기존 아이템이 없는 경우, 아이템을 Map에 추가/업데이트합니다.
		if (!existingItem || (item.liveTitle && !existingItem.liveTitle)) {
			itemsMap.set(item.id, item);
		}
	});

	// Map의 값들만 추출하여 배열로 반환합니다.
	return Array.from(itemsMap.values());
}

function App() {
	const [inputValue, setInputValue] = useState("");
	/** @type {{ current: HTMLInputElement | null }} */
	const inputRef = useRef(null);
	/** @type {{ current: HTMLInputElement | null }} */
	const searchContainerRef = useRef(null);
	const { queriesIsLoading, queriesIsResultsIsSuccess, resultsParseData } = useGetLiveChannelData(inputValue);
	const [date] = useState(new Date());
	const [sort, setSort] = useState("live");

	const queryData = useMemo(() => {
		const uniqueDataWithPriority = filterUniqueItemsWithPriority(resultsParseData);
		const filterData = uniqueDataWithPriority.filter((item) => item.name.includes(inputValue));
		return filterData.sort((a, b) => {
			//정렬
			if (sort === "view") {
				return a.viewCount - b.viewCount;
			} else if (sort === "live") {
				return new Date(b.openDate).getTime() - new Date(a.openDate).getTime();
			} else {
				return 0;
			}
		});
	}, [inputValue, resultsParseData, sort]);

	//로딩 관련 로직
	const [isLoading, setIsLoading] = useState(false);
	const onClickHandler = () => {
		setIsLoading(true);
		if (searchContainerRef.current) {
			searchContainerRef.current.style.maxHeight = "60vw";
		}
		if (searchContainerRef.current && queriesIsLoading) {
			searchContainerRef.current.classList.add("turn-off-anim");
			searchContainerRef.current.classList.remove("turn-on-anim");
		}
	};

	/** @type {{ current: NodeJS.Timeout | null }} */
	const timer = useRef(null);
	useEffect(() => {
		if (isLoading) {
			timer.current = setTimeout(() => {
				// 타이머 로직
				setIsLoading(false);
				setInputValue((prev) => (inputRef.current ? inputRef.current.value : prev));
				if (searchContainerRef.current) {
					searchContainerRef.current.style.maxHeight = "none";
				}
			}, 800);
		}

		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, [isLoading]);

	useEffect(() => {
		if (searchContainerRef.current && queriesIsResultsIsSuccess && !isLoading) {
			searchContainerRef.current.classList.add("turn-on-anim");
			searchContainerRef.current.classList.remove("turn-off-anim");
		}
	}, [queriesIsResultsIsSuccess, searchContainerRef.current, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="App">
			<main>
				<div>
					<select value={sort} onChange={(e) => setSort(e.target.value)}>
						<option value="live">라이브 방송 순</option>
						<option value="view">시청자 수 순</option>
					</select>
					<input type="search" ref={inputRef} aria-label="search" placeholder="스트리머 이름" />
					<button onClick={onClickHandler}>검색</button>
					{date.toString()}
				</div>

				<section className="search_container" ref={searchContainerRef}>
					{queryData.map((item, index) => (
						<ChannelCard key={item.id} data={resultsParseData[index]}></ChannelCard>
					))}
				</section>
			</main>
		</div>
	);
}

export default App;
