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
			enabled: !!favorite.id,
			staleTime: 1000 * 60 * 60
		};
	});
	const queriesResults = useQueries({
		queries,
		combine: (queries, index) => {
			return queries
				.map((query) => {
					const platform = favoriteArray[index].platform;
					if (query.isLoading) return { isLoading: true };
					return parseFunctions[indexToPlatform[platform]](query.data);
				})
				.flat(2);
		}
	});

	/** @type {object[]} */
	const [resultsParseData, setResultParseData] = useState([]);
	const [isSuccess, setIsSuccess] = useState(false);
	useEffect(() => {
		if (queriesResults.every((item) => "id" in item)) setIsSuccess(true);
		else setIsSuccess(false);
	}, [queriesResults]);

	useEffect(() => {
		if (isSuccess) {
			const uniqueDataWithPriority = filterUniqueItemsWithPriority(queriesResults, "id", "liveTitle");
			const filterData = uniqueDataWithPriority.filter((item, index) => {
				const platform = favoriteArray[index].platform;
				if (platform !== "chzzk") {
					return favorite.some((favorite) => favorite === item.id);
				} else {
					return favorite.some((favorite) => favorite === item.name);
				}
			});
			setResultParseData(filterData);
		}
	}, [isSuccess, queriesResults]);

	return {
		queriesResults: resultsParseData,
		isSuccess
	};
};

export default useGetFavoriteChannelData;
