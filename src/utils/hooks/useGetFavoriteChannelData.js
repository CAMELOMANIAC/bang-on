//@ts-check
import { useQueries } from "@tanstack/react-query";
import { fetchAfreecaData, fetchAfreecaLiveData, fetchChzzkData } from "../function/fetchData";
import { parseFunctions } from "./useGetLiveChannelData";
import { useEffect, useState } from "react";
import { filterUniqueItemsWithPriority, getLocalStorageToArray } from "../function/common";

const fetchFunction = {
	chzzk: fetchChzzkData,
	afreeca: fetchAfreecaData,
	afreecaLive: fetchAfreecaLiveData
};
const indexToPlatform = {
	chzzk: 0,
	afreeca: 1,
	afreecaLive: 2
};

/**
 * 로컬저장소에서 즐겨찾는 채널 데이터를 가져오는 훅입니다.
 *
 * @returns {{ queriesResults: any; isSuccess: any; }}
 */
const useGetFavoriteChannelData = () => {
	const favorite = getLocalStorageToArray("id");
	const platform = getLocalStorageToArray("platform");
	const favoriteArray = [];
	favorite.forEach((_item, index) => {
		if (platform[index] === "afreeca") {
			favoriteArray.push({ platform: "afreeca", id: favorite[index] });
			favoriteArray.push({ platform: "afreecaLive", id: favorite[index] });
		}
		if (platform[index] === "chzzk") {
			favoriteArray.push({ platform: "chzzk", id: favorite[index] });
		}
	});
	const queries = favoriteArray.map((favorite) => {
		return {
			queryKey: [favorite.id],
			queryFn: () => fetchFunction[favorite.platform](favorite.id),
			enabled: !!favorite.id
		};
	});
	const queriesResults = useQueries({
		queries,
		combine: (queries) => {
			// 모든 쿼리가 로딩 중인지 확인
			const allLoading = queries.every((query) => query.isLoading);

			// 모든 쿼리가 로딩 중이면, isLoading만 반환
			if (allLoading) {
				return { isLoading: true };
			}

			// 모든 쿼리의 결과를 평탄화하여 반환
			return queries.flatMap((query, index) => {
				const platform = favoriteArray[index].platform;
				// isLoading 상태는 여기서 무시되며, 데이터만 처리
				return parseFunctions[indexToPlatform[platform]](query.data);
			});
		}
	});

	/** @type {object[]} */
	const [resultsParseData, setResultParseData] = useState([]);
	const [isSuccess, setIsSuccess] = useState(false);
	useEffect(() => {
		if (Array.isArray(queriesResults) && queriesResults.every((item) => "id" in item)) setIsSuccess(true);
		else setIsSuccess(false);
		//console.log(queriesResults);
	}, [queriesResults]);

	useEffect(() => {
		if (isSuccess && Array.isArray(queriesResults)) {
			const uniqueDataWithPriority = filterUniqueItemsWithPriority(queriesResults, "id", "liveTitle");
			const filterData = uniqueDataWithPriority.filter((item, index) => {
				const platform = favoriteArray[index]?.platform;
				if (platform === "chzzk") {
					return favorite.some((favorite) => favorite === item.name);
				} else {
					return favorite.some((favorite) => favorite === item.id);
				}
			});
			setResultParseData(filterData);
		}
	}, [isSuccess, queriesResults]); // eslint-disable-line

	return {
		queriesResults: resultsParseData,
		isSuccess
	};
};

export default useGetFavoriteChannelData;
