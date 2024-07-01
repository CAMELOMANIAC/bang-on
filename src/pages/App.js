import "../styles/App.css";
import { useEffect, useMemo, useRef, useState } from "react";
import useGetLiveChannelData from "../utils/hooks/useGetLiveChannelData.js";
import ChannelCard from "../components/ChannelCard.jsx";

function App() {
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef();
	const { resultsParseData } = useGetLiveChannelData(inputValue);
	const [date] = useState(new Date());

	const uniqueData = useMemo(() => {
		const ids = new Set();
		return resultsParseData.filter((item) => {
			if (ids.has(item.id)) {
				return false;
			} else {
				ids.add(item.id);
				return true;
			}
		});
	}, [resultsParseData]);

	useEffect(() => {
		console.log(uniqueData);
	}, [uniqueData]);

	return (
		<div className="App">
			<main>
				<input type="text" ref={inputRef} aria-label="search" />
				<button
					onClick={() => {
						setInputValue(inputRef.current.value);
					}}
				>
					검색
				</button>
				{date.toString()}

				<article className="search_container">
					{uniqueData.map((item, index) => (
						<ChannelCard key={item.id} data={resultsParseData[index]}></ChannelCard>
					))}
				</article>
			</main>
		</div>
	);
}

export default App;
