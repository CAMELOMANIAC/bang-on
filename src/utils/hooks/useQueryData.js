//@ts-check
import { useMemo, useState } from "react";
import { filterUniqueItemsWithPriority } from "../function/common";

/* @param {keyof typeof sortType} */
export const sortType = {
	LIVE: "live",
	VIEW: "view"
};

/**
 * resultsParseData를 필터링하고 정렬하는 훅입니다.
 *
 * @param {string} inputValue - 필터링을 위한 검색어 문자열입니다
 * @param {object[]} resultsParseData
 * @returns {{ queryData: object[]; sort: string; setSort: React.Dispatch<React.SetStateAction<string>>; }}
 */
const useQueryData = (inputValue, resultsParseData) => {
	const [sort, setSort] = useState(sortType.LIVE);

	const queryData = useMemo(() => {
		const uniqueDataWithPriority = filterUniqueItemsWithPriority(resultsParseData, "id", "liveTitle"); //중복제거 및 liveTitle이 있는 아이템을 우선적으로 선택
		const filterData = uniqueDataWithPriority.filter((item) => item.name.includes(inputValue)); //검색어 포함된 결과만 반환하도록 필터링
		return filterData.sort((a, b) => {
			//정렬
			if (sort === sortType.VIEW) {
				return a.viewCount - b.viewCount;
			} else if (sort === sortType.LIVE) {
				return new Date(b.openDate).getTime() - new Date(a.openDate).getTime();
			} else {
				return 0;
			}
		});
	}, [inputValue, resultsParseData, sort]);
	return { queryData, sort, setSort };
};

export default useQueryData;
