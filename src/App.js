import { useQueries, useQuery } from "react-query";
import "./App.css";
import { Fragment, useEffect, useRef, useState } from "react";
import ChannelCard from "./component/ChannelCard";
import broadReadyImage from "./img/broadReady.svg";
import { useRecoilState, useSetRecoilState } from "recoil";
import { searchTypeState, showLiveState, steamingServiceState, subscribedChannelState } from "./globalState/atom";
import { getLocalStorageToArray } from "./publicFunction/getLocalStorageToArray";

function App() {
	const [searchQuery, setSearchQuery] = useState("");
	const [count, setCount] = useState(0);
	const resultsRef = useRef([]);
	const [date, setDate] = useState(new Date());
	const afreecaLiveChannelData = useRef([]);
	const setIsShowLive = useSetRecoilState(showLiveState);
	const [searchType, setSearchType] = useRecoilState(searchTypeState);
	const [steamingService, setSteamingService] = useRecoilState(steamingServiceState);
	const [subscribedChannel, setSubscribedChannel] = useRecoilState(subscribedChannelState);

	const convertJSONPToJSON = (jsonp) => {
		return jsonp.replace(/^[^\(]+\((.*)\)$/, "$1");
	};

	const fetchAfreecaData = async (searchQuery) => {
		return fetch(
			//아프리카는 자체적으로 cors에 제한을 받지 않게 JSONP 형식이므로 fetch로 받아온 후 JSONP 형식을 JSON으로 변환
			`https://sch.afreecatv.com/api.php?callback=jQuery11020675609536225807_1714723793705&m=bjSearch&v=2.0&szOrder=&szKeyword=${encodeURIComponent(
				searchQuery
			)}&nPageNo=1&nListCnt=10&szType=json&c=UTF-8&tab=BJ&location=total_search`
		)
			.then((response) => response.text())
			.then((text) => {
				const jsonText = convertJSONPToJSON(text);
				const data = JSON.parse(jsonText);
				return data;
			});
	};

	const fetchAfreecaLiveData = async (searchQuery) => {
		return fetch(
			`https://sch.afreecatv.com/api.php?callback=jQuery1102029730713549332743_1714718653058&m=liveSearch&v=1.0&szOrder=&c=UTF-8&szKeyword=${encodeURIComponent(
				searchQuery
			)}&nPageNo=1&nListCnt=40&hl=1&onlyParent=1&tab=LIVE&location=total_search`
		)
			.then((response) => response.text())
			.then((text) => {
				const jsonText = convertJSONPToJSON(text);
				const data = JSON.parse(jsonText);
				return data.REAL_BROAD;
			});
	};

	const fetchChzzkData = async (searchQuery) => {
		return fetch(
			//치지직은 cors 규약 때문에 프록시를 사용해야함
			`/chzzk_api/service/v1/search/channels?keyword=${encodeURIComponent(
				searchQuery
			)}&offset=0&size=13&withFirstChannelContent=true`
		).then((response) => response.json());
	};

	const queries = [
		{
			queryKey: "chzzk",
			queryFn: () => fetchChzzkData(searchQuery),
			enabled: false,
			onSuccess: () => {
				setDate(new Date());
			}
		},
		{
			queryKey: "afreeca",
			queryFn: () => fetchAfreecaData(searchQuery),
			enabled: false,
			onSuccess: () => {
				setDate(new Date());
			}
		},
		{
			queryKey: "afreecaLive",
			queryFn: () => fetchAfreecaLiveData(searchQuery),
			enabled: false,
			onSuccess: (data) => {
				setDate(new Date());
				afreecaLiveChannelData.current = data;
			},
			onError: (error) => {
				console.error(error);
			}
		}
	];

	const streamService = ["chzzk", "afreeca"];

	resultsRef.current = useQueries(queries);

	useEffect(() => {
		//로컬스토리지의 스트리머 구독 정보를 가져옴
		setSubscribedChannel(getLocalStorageToArray());
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const subscibeQueries = Object.keys(localStorage).map((key, index) => {
		const item = JSON.parse(Object.values(localStorage)[index]);
		let queryFn = () => null;
		switch (item.platform) {
			case "chzzk":
				queryFn = () => fetchChzzkData(item.channelName);
				break;
			case "afreeca":
				queryFn = () => fetchAfreecaData(item.channelName);
				break;
			default:
				queryFn = () => null;
				break;
		}
		return {
			queryKey: ["subscribedChannelData", key], //채널이름 키값 앞에 플랫폼을 명시해놨으므로 제거해야함
			queryFn
		};
	});
	const results = useQueries(subscibeQueries);

	// useEffect(() => {
	// 	console.log(results.map((result, _index) => result.data));
	// }, [results]);

	return (
		<div className="App">
			<header className="App-header">
				<input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
				<button onClick={() => resultsRef.current.forEach((result) => result.refetch())}>검색</button>
				{count}
				<button onClick={() => setCount((prev) => prev - 1)}>빼기</button>
				<button onClick={() => setCount((prev) => prev + 1)}>더하기</button>
				{date.toString()}

				<button onClick={() => setIsShowLive((prev) => !prev)}>라이브 보기</button>

				{streamService.map((service) => (
					<Fragment key={service}>
						<input
							type="checkbox"
							checked={steamingService.some((item) => item === service)}
							id={service}
							onChange={() =>
								setSteamingService((prev) =>
									prev.some((item) => item === service)
										? prev.filter((item) => item !== service)
										: [...prev, service]
								)
							}
						></input>
						<label htmlFor={service}>{service}</label>
					</Fragment>
				))}
				<select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
					<option value="channelName">채널명</option>
				</select>
				<div className="subscribe_container">
					{results.length &&
						results.map((result, index) =>
							result.data && Object.keys(result.data).includes("content") ? (
								<Fragment key={index}>
									<ChannelCard
										key={index}
										liveImage={
											result.data.content.data[0]?.content?.live?.liveImageUrl
												? `${result.data.content.data[0]?.content?.live?.liveImageUrl.replace(
														"{type}",
														"480"
												  )}`
												: broadReadyImage
										}
										channelImage={
											result.data.content.data[0]?.channel.channelImageUrl
												? result.data.content.data[0]?.channel.channelImageUrl
												: null
										}
										info={{
											platform: "chzzk",
											channelName: result.data.content.data[0]?.channel.channelName,
											liveTitle:
												result.data.content.data[0]?.content?.live &&
												result.data.content.data[0]?.content?.live?.liveTitle,
											openDate:
												result.data.content.data[0]?.content?.live &&
												result.data.content.data[0]?.content?.live?.openDate,
											adult:
												result.data.content.data[0]?.content?.live?.adult &&
												result.data.content.data[0]?.content?.live?.adult
										}}
									></ChannelCard>
								</Fragment>
							) : (
								<Fragment key={index}>
									<ChannelCard
										key={index}
										liveImage={
											afreecaLiveChannelData.current.find(
												(channel) => channel.user_nick === result.data?.DATA[0].user_nick
											)?.broad_img || broadReadyImage
										}
										channelImage={result.data?.DATA[0].station_logo}
										info={{
											platform: "afreeca",
											channelName: result.data?.DATA[0].user_nick,
											liveTitle: (
												afreecaLiveChannelData.current.find(
													(channel) => channel.user_nick === result.data?.DATA[0].user_nick
												) || { broad_title: null }
											).broad_title,
											openDate:
												afreecaLiveChannelData.current.find(
													(channel) => channel.user_nick === result.data?.DATA[0].user_nick
												)?.broad_start || null
										}}
									></ChannelCard>
								</Fragment>
							)
						)}
				</div>

				<div className="search_container">
					{resultsRef.current &&
						resultsRef.current.map((result, index) => {
							if (!result.isSuccess) return null;
							if (index === 0) {
								return (
									<Fragment key={index}>
										{result.data.content?.data.map((item, index) => (
											<ChannelCard
												key={index}
												liveImage={
													item.content?.live?.liveImageUrl
														? `${item.content?.live?.liveImageUrl.replace("{type}", "480")}`
														: broadReadyImage
												}
												channelImage={
													item.channel.channelImageUrl ? item.channel.channelImageUrl : null
												}
												info={{
													platform: "chzzk",
													channelName: item.channel.channelName,
													liveTitle: item.content?.live && item.content?.live?.liveTitle,
													openDate: item.content?.live && item.content?.live?.openDate,
													adult: item.content?.live?.adult && item.content?.live?.adult
												}}
											></ChannelCard>
										))}
									</Fragment>
								);
							}
							if (index === 1) {
								return (
									<Fragment key={index}>
										{result.data.DATA.map((item, index) => (
											<ChannelCard
												key={index}
												liveImage={
													afreecaLiveChannelData.current.find(
														(channel) => channel.user_nick === item.user_nick
													)?.broad_img || broadReadyImage
												}
												channelImage={item.station_logo}
												info={{
													platform: "afreeca",
													channelName: item.user_nick,
													liveTitle: (
														afreecaLiveChannelData.current.find(
															(channel) => channel.user_nick === item.user_nick
														) || { broad_title: null }
													).broad_title,
													openDate:
														afreecaLiveChannelData.current.find(
															(channel) => channel.user_nick === item.user_nick
														)?.broad_start || null
												}}
											></ChannelCard>
										))}
									</Fragment>
								);
							}
							return null;
						})}
				</div>
			</header>
		</div>
	);
}

export default App;
