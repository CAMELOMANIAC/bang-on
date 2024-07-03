//@ts-check
import "../styles/App.css";
import { useEffect, useRef, useState } from "react";
import useGetLiveChannelData from "../utils/hooks/useGetLiveChannelData.js";
import ChannelCard from "../components/ChannelCard.jsx";
import React from "react";
import useQueryData from "../utils/hooks/useQueryData.js";
import useQueryLoading from "../utils/hooks/useQueryLoading.js";
export const sortType = {
	LIVE: "live",
	VIEW: "view"
};

function App() {
	const [inputValue, setInputValue] = useState("");
	/** @type {{ current: HTMLInputElement | null }} */
	const inputRef = useRef(null);
	/** @type {{ current: HTMLInputElement | null }} */
	const searchContainerRef = useRef(null);
	const { queriesIsLoading, queriesIsResultsIsSuccess, resultsParseData } = useGetLiveChannelData(inputValue);
	const { queryData, sort, setSort } = useQueryData(inputValue, resultsParseData);
	const { onClickHandler, isLoading } = useQueryLoading(
		searchContainerRef,
		queriesIsLoading,
		inputRef,
		setInputValue,
		queriesIsResultsIsSuccess
	);

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
					{isLoading && "loading"}
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
