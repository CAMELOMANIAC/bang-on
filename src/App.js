import { useQueries } from "react-query";
import "./App.css";
import { Fragment, useEffect, useState } from "react";
import ChannelCard from "./component/ChannelCard";
import { useRecoilState, useSetRecoilState } from "recoil";
import { searchTypeState, showLiveState, steamingServiceState, subscribedChannelState } from "./globalState/atom";
import { getLocalStorageToArray } from "./publicFunction/getLocalStorageToArray";
import { fetchAfreecaData, fetchChzzkData } from "./publicFunction/fetchStreamingData";

const streamService = ["chzzk", "afreeca"];

function App() {
	const [searchQuery, setSearchQuery] = useState("");
	const [count, setCount] = useState(0);
	const [date, setDate] = useState(new Date());
	const setIsShowLive = useSetRecoilState(showLiveState);
	const [searchType, setSearchType] = useRecoilState(searchTypeState);
	const [steamingService, setSteamingService] = useRecoilState(steamingServiceState);
	const [_subscribedChannel, setSubscribedChannel] = useRecoilState(subscribedChannelState); // eslint-disable-line no-unused-vars

	const queries = [
		{
			queryKey: ["chzzk"],
			queryFn: () => fetchChzzkData(searchQuery),
			enabled: false,
			onSuccess: () => {
				setDate(new Date());
			}
		},
		{
			queryKey: ["afreeca"],
			queryFn: () => fetchAfreecaData(searchQuery),
			enabled: false,
			onSuccess: () => {
				setDate(new Date());
			}
		}
	];
	const searchChannelData = useQueries(queries);

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

	const subscribedChannelData = useQueries(subscibeQueries);

	const streamServiceOnChangeHandler = (service) => {
		setSteamingService((prev) =>
			prev.some((item) => item === service) ? prev.filter((item) => item !== service) : [...prev, service]
		);
	};

	return (
		<div className="App">
			<header className="App-header">
				<input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
				<button onClick={() => searchChannelData.forEach((result) => result.refetch())}>검색</button>
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
							onChange={() => streamServiceOnChangeHandler(service)}
						></input>
						<label htmlFor={service}>{service}</label>
					</Fragment>
				))}

				<select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
					<option value="channelName">채널명</option>
				</select>

				<div className="subscribe_container">
					{subscribedChannelData.length &&
						subscribedChannelData.map((result, index) =>
							result.data && Object.keys(result.data).includes("content") ? (
								result.data.content.data[0]?.channel.channelName ===
								JSON.parse(Object.values(localStorage)[index]).channelName ? (
									<Fragment key={index}>
										<ChannelCard
											key={index}
											channelImage={
												result.data.content.data[0]?.channel.channelImageUrl
													? result.data.content.data[0]?.channel.channelImageUrl
													: null
											}
											info={{
												platform: "chzzk",
												liveImage: result.data.content.data[0]?.content?.live?.liveImageUrl
													? `${result.data.content.data[0]?.content?.live?.liveImageUrl.replace(
															"{type}",
															"480"
													  )}`
													: undefined,
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
									//치지직 통합검색에는 출력되지만 개별검색에서 출력되지 않는 경우
									<Fragment key={index}>
										<ChannelCard
											key={index}
											channelImage={
												result.data.content.data[0]?.channel.channelImageUrl
													? result.data.content.data[0]?.channel.channelImageUrl
													: null
											}
											info={{
												platform: "chzzk",
												channelName: JSON.parse(Object.values(localStorage)[index]).channelName,
												liveTitle: false,
												openDate: false,
												adult: false
											}}
										></ChannelCard>
									</Fragment>
								)
							) : (
								<Fragment key={index}>
									<ChannelCard
										key={index}
										channelImage={result.data?.DATA[0].station_logo}
										info={{
											platform: "afreeca",
											channelName: result.data?.DATA[0].user_nick
										}}
									></ChannelCard>
								</Fragment>
							)
						)}
				</div>

				<div className="search_container">
					{searchChannelData &&
						searchChannelData.map((result, index) => {
							if (!result.isSuccess) return null;
							if (index === 0) {
								return (
									<Fragment key={index}>
										{result.data.content?.data.map((item, index) => (
											<ChannelCard
												key={index}
												channelImage={
													item.channel.channelImageUrl ? item.channel.channelImageUrl : null
												}
												info={{
													platform: "chzzk",
													channelName: item.channel.channelName,
													liveTitle: item.content?.live && item.content?.live?.liveTitle,
													openDate: item.content?.live && item.content?.live?.openDate,
													adult: item.content?.live?.adult && item.content?.live?.adult,
													liveImage: item.content?.live?.liveImageUrl
														? `${item.content?.live?.liveImageUrl.replace("{type}", "480")}`
														: undefined
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
												channelImage={item.station_logo}
												info={{
													platform: "afreeca",
													channelName: item.user_nick
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
