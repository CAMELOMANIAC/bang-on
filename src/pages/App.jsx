//@ts-check
import "../styles/App.css";
import { useEffect, useRef } from "react";
import useGetLiveChannelData from "../utils/hooks/useGetLiveChannelData.js";
import ChannelCard from "../components/ChannelCard.jsx";
import React from "react";
import useQueryData, { sortType } from "../utils/hooks/useQueryData.js";
import useQueryLoading from "../utils/hooks/useQueryLoading.js";
import { useLocation } from "react-router-dom";

function App() {
	const { search } = useLocation();
	const searchParams = decodeURI(search.replace("?search=", ''));
	/** @type {{ current: HTMLInputElement | null }} */
	const inputRef = useRef(null);
	/** @type {{ current: HTMLInputElement | null }} */
	const searchContainerRef = useRef(null);
	const { isSuccess, queriesResults } = useGetLiveChannelData(searchParams);
	const { queryData, sort, setSort } = useQueryData(searchParams, queriesResults);
	const { onClickHandler, isLoading } = useQueryLoading(
		searchContainerRef,
		inputRef,
		isSuccess
	);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.value = searchParams;
		}
	}, [searchParams]);

	return (
		<div className="App">
			<main>
				<div>
					<select value={sort} onChange={(e) => setSort(e.target.value)}>
						<option value={sortType.LIVE}>라이브 방송 순</option>
						<option value={sortType.VIEW}>시청자 수 순</option>
						<option value={sortType.PLATFROM}>플랫폼 순</option>
					</select>
					<input type="search" ref={inputRef} aria-label="search" placeholder="스트리머 이름" />
					<button onClick={onClickHandler}>검색</button>
					{isLoading && "loading"}
				</div>

				<section className="search_container" ref={searchContainerRef}>
					{queryData.map((item, index) => (
						<ChannelCard key={item.id} data={queryData[index]}></ChannelCard>
					))}
				</section>
			</main>
		</div>
	);
}

export default App;
