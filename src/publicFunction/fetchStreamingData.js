import convertJSONPToJSON from "./convertJSONPToJSON";

export const fetchAfreecaData = async (searchQuery) => {
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

export const fetchChzzkData = async (searchQuery) => {
	return fetch(
		//치지직은 cors 규약 때문에 프록시를 사용해야함
		`/chzzk_api/service/v1/search/channels?keyword=${encodeURIComponent(
			searchQuery
		)}&offset=0&size=13&withFirstChannelContent=true`
	).then((response) => response.json());
};
