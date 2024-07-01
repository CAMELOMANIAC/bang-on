//@ts-check
import "../styles/App.css";
import { useMemo, useRef, useState } from "react";
import useGetLiveChannelData from "../utils/hooks/useGetLiveChannelData.js";
import ChannelCard from "../components/ChannelCard.jsx";
import React from "react";
/**
 * 아이템이 고유한지 확인하는 콜백용 함수로 Set 객체를 사용합니다.
 * @param {Set} Set - 현재 처리 중인 Set 객체
 * @param {{id:string}} item - 처리할 아이템
 * @returns {boolean} 아이템이 고유하면 true, 그렇지 않으면 false
 */
function isUnique(Set, item) {
	if (Set.has(item.id)) {
		return false;
	} else {
		Set.add(item.id);
		return true;
	}
}

function App() {
	const [inputValue, setInputValue] = useState("");
	/** @type {{ current: HTMLInputElement | null }} */
	const inputRef = useRef(null);
	const { resultsParseData } = useGetLiveChannelData(inputValue);
	const [date] = useState(new Date());
	const [sort, setSort] = useState("platform");

	const queryData = useMemo(() => {
		//중복 제거
		const ids = new Set(); //중복제거를 위한 Set 객체

		const uniqueData = resultsParseData.filter((item) => isUnique(ids, item)); //중복제거
		const filterData = uniqueData.filter((item) => item.name.includes(inputValue)); //검색어 필터링
		return filterData.sort((a, b) => {
			//정렬
			if (sort === "view") {
				return b.viewCount - a.viewCount;
			} else if (sort === "live") {
				return new Date(b.openDate).getTime() - new Date(a.openDate).getTime();
			} else {
				return 0;
			}
		});
	}, [inputValue, resultsParseData, sort]);

	return (
		<div className="App">
			<main>
				<input type="text" ref={inputRef} aria-label="search" />
				<button
					onClick={() => {
						setInputValue(inputRef.current ? inputRef.current.value : "");
					}}
				>
					검색
				</button>
				{date.toString()}

				<article className="search_container">
					{queryData.map((item, index) => (
						<ChannelCard key={item.id} data={resultsParseData[index]}></ChannelCard>
					))}
				</article>
			</main>
		</div>
	);
}

export default App;
