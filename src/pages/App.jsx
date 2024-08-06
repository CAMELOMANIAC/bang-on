//@ts-check
import "../styles/App.css";
import { useEffect, useRef } from "react";
import useGetLiveChannelData from "../utils/hooks/useGetLiveChannelData.js";
import ChannelCard from "../components/ChannelCard.jsx";
import React from "react";
import useQueryData, { sortType } from "../utils/hooks/useQueryData.js";
import useQueryLoading from "../utils/hooks/useQueryLoading.js";
import { useLocation } from "react-router-dom";
import Chat from "../components/Chat.jsx";
import useQueryLoadingAnimation from '../utils/hooks/useQueryLoadingAnimation';

function App() {
	const { search } = useLocation();
	const searchParams = decodeURI(search.replace("?search=", ''));
	/** @type {{ current: HTMLInputElement | null }} */
	const searchContainerRef = useRef(null);
	const { isSuccess, queriesResults } = useGetLiveChannelData(searchParams);
	const { queryData, sort, setSort } = useQueryData(searchParams, queriesResults);
	useQueryLoadingAnimation();
	// const { onClickHandler, isLoading } = useQueryLoading(
	// 	searchContainerRef,
	// 	inputRef,
	// 	isSuccess
	// );

	return (
		<div className="App">
			<main>
				<div>
					{/* <select value={sort} onChange={(e) => setSort(e.target.value)}>
						<option value={sortType.LIVE}>라이브 방송 순</option>
						<option value={sortType.VIEW}>시청자 수 순</option>
						<option value={sortType.PLATFROM}>플랫폼 순</option>
					</select> */}
					<Chat></Chat>
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
