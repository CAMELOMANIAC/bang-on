const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
	app.use(
		"/chzzk_api",
		createProxyMiddleware({
			target: "https://api.chzzk.naver.com/",
			changeOrigin: true,
			pathRewrite: {
				"^/api": "" // '/api'를 ''로 대체합니다.
			}
		})
	);

	app.use(
		"/chzzk_thumb",
		createProxyMiddleware({
			target: "https://livecloud-thumb.akamaized.net/",
			changeOrigin: true,
			pathRewrite: {
				"^/api": "" // '/api'를 ''로 대체합니다.
			}
		})
	);
};
//치지직 태그검색
//https://api.chzzk.naver.com/service/v1/tag/lives?size=20&sortType=POPULAR&tags=%EB%B2%84%ED%8A%9C%EB%B2%84
//아프리카 태그검색
//https://sch.afreecatv.com/api.php?callback=jQuery110203161912263991835_1714467235324&m=liveSearch&v=1&c=UTF-8&hl=1&onlyParent=1&tab=TOTAL&location=total_search&szKeyword=%25EB%25B2%2584%25ED%258A%259C%25EB%25B2%2584&nPageNo=1&nListCnt=20&szOrder=view_cnt&isHashSearch=1&_=1714467235325
