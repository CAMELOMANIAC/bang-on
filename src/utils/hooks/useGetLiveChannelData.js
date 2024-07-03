//@ts-check
import { useQueries } from "react-query";
import { fetchChzzkData, fetchAfreecaData, fetchAfreecaLiveData } from "../function/fetchData";
import { useEffect, useState } from "react";

/**
 * @typedef {Object} ParsedData
 * @property {string} id
 * @property {string} name
 * @property {string | null} imageUrl
 * @property {string} platform
 * @property {string | null} [liveTitle]
 * @property {string | null} [liveImageUrl]
 * @property {string | null} [openDate]
 * @property {number | null} [viewCount]
 * @property {boolean} [isAdult]
 * @property {string[] | null} [tags]
 * @property {string | null} [liveCategory]
 * @property {string} [liveUrl]
 */

/**
 * 치지직, 아프리카 데이터를 가져오는 훅입니다.
 *
 * @param {string} searchQuery - 검색어 문자열입니다.
 * @returns {{ queriesIsLoading: boolean; queriesIsResultsIsSuccess: boolean; resultsParseData: ParsedData[]; }}
 */
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
	/**
	 * 치지직 데이터를 파싱합니다.
	 *
	 * @param {any} data
	 * @returns {ParsedData[]}
	 */
	const parseChzzkData = (data) => {
		if (!data) return [];
		return Array.isArray(data)
			? data?.map((data) => ({
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
			: [];
	};
	/**
	 * 아프리카 데이터를 파싱합니다.
	 *
	 * @param {any} data
	 * @returns {ParsedData[]}
	 */
	const parseAfreecaData = (data) => {
		if (!data) return [];
		return Array.isArray(data)
			? data.map((item) => ({
					id: item.user_id,
					name: item.user_nick,
					imageUrl: item.station_logo || null,
					platform: "afreeca"
			  }))
			: [];
	};

	/**
	 * 아프리카 라이브 데이터를 파싱합니다.
	 *
	 * @param {any} data
	 * @returns {ParsedData[]}
	 */
	const parseAfreecaLiveData = (data) => {
		if (!data) return [];
		return Array.isArray(data)
			? data.map((item) => ({
					id: item.user_id,
					name: item.user_nick,
					imageUrl:
						`http://stimg.afreecatv.com/LOGO/${item.user_id.slice(0, 2)}/${item.user_id}/${
							item.user_id
						}.jpg` || null,
					liveTitle: item.b_broad_title || null,
					liveImageUrl: item.broad_img || null,
					openDate: item.broad_start || null,
					viewCount: item.current_view_cnt || null,
					isAdult: false,
					tags: [...item.category_tags, ...item.hash_tags] || null,
					liveCategory: item.broad_cate_name || null,
					liveUrl: item.url,
					platform: "afreeca"
			  }))
			: [];
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

	/** @type {object[]} */
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
