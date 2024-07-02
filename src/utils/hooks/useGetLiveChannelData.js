import { useQueries } from "react-query";
import { fetchChzzkData, fetchAfreecaData, fetchAfreecaLiveData } from "../function/fetchData";
import { useEffect, useState } from "react";
const useGetLiveChannelData = (searchQuery) => {
	const queryKey = {
		chzzk: 0,
		afreeca: 1,
		afreecaLive: 2
	};
	const queries = [
		{
			queryKey: [queryKey.chzzk, searchQuery],
			queryFn: () => fetchChzzkData(searchQuery),
			enabled: !!searchQuery,
			staleTime: 1000 * 60 * 5
		},
		{
			queryKey: [queryKey.afreeca, searchQuery],
			queryFn: () => fetchAfreecaData(searchQuery),
			enabled: !!searchQuery,
			staleTime: 1000 * 60 * 5
		},
		{
			queryKey: [queryKey.afreecaLive, searchQuery],
			queryFn: () => fetchAfreecaLiveData(searchQuery),
			enabled: !!searchQuery,
			staleTime: 1000 * 60 * 5
		}
	];
	const queriesResults = useQueries(queries);

	const parseChzzkData = (data) => {
		if (!data) return;
		return (
			Array.isArray(data) &&
			data?.map((data) => ({
				id: data.channel.channelId,
				name: data.channel.channelName,
				imageUrl: data.channel.channelImageUrl || null,
				liveTitle: data.content?.live?.liveTitle || null,
				liveImageUrl: data.content?.live?.liveImageUrl || null,
				openDate: data.content?.live?.openDate || null,
				viewCount: data.content?.live?.concurrentUserCount || null,
				isAdult: data.content?.live?.adult || false,
				tags: data.content?.live?.tags || null,
				liveCategory: data.content?.live?.liveCategory || null,
				liveUrl: `https://www.chzzk.com/live/${data.channel.channelId}`,
				platform: "chzzk"
			}))
		);
	};
	const parseAfreecaData = (data) => {
		if (!data) return;
		return (
			Array.isArray(data) &&
			data?.map((data) => ({
				id: data.user_id,
				name: data.user_nick,
				imageUrl: data.station_logo || null,
				platform: "afreeca"
			}))
		);
	};
	const parseAfreecaLiveData = (data) => {
		if (!data) return;
		return (
			Array.isArray(data) &&
			data?.map((data) => ({
				id: data.user_id,
				name: data.user_nick,
				imageUrl:
					`http://stimg.afreecatv.com/LOGO/${data.user_id.slice(0, 2)}/${data.user_id}/${data.user_id}.jpg` ||
					null,
				liveTitle: data.b_broad_title || null,
				liveImageUrl: data.broad_img || null,
				openDate: data.broad_start || null,
				viewCount: data.current_view_cnt || null,
				isAdult: false,
				tags: [...data.category_tags, ...data.hash_tags] || null,
				liveCategory: data.broad_cate_name || null,
				liveUrl: data.url,
				platform: "afreeca"
			}))
		);
	};

	//사이드이펙트 감지 변수
	const queriesIsLoading = queriesResults?.every((result) => result.isLoading === false);
	const queriesIsIdle = queriesResults?.every((result) => result.isIdle === false);

	const queriesResultsIsSuccess = queriesResults?.map((result) => result.isSuccess);
	const queriesIsResultsIsSuccess = queriesResults?.every((result) => result.isSuccess === true);

	//파싱 함수
	const parseFunctions = {
		[queryKey.chzzk]: (data) => parseChzzkData(data),
		[queryKey.afreeca]: (data) => parseAfreecaData(data),
		[queryKey.afreecaLive]: (data) => parseAfreecaLiveData(data)
	};

	const [resultsParseData, setResultParseData] = useState([]);

	useEffect(() => {
		setResultParseData([]);
		if (queriesIsLoading && queriesIsIdle) {
			queriesResultsIsSuccess.forEach((isSuccess, index) => {
				if (isSuccess)
					setResultParseData((prev) => [...prev, ...parseFunctions[index](queriesResults[index].data)]);
			});
		}
	}, [queriesIsLoading, queriesIsIdle, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

	return { queriesIsLoading, queriesIsResultsIsSuccess, resultsParseData };
};

export default useGetLiveChannelData;
