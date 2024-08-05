import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import reportWebVitals from "./reportWebVitals";
import App from "./pages/App";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Error from "./pages/Error";
import Favorite from "./pages/Favorite";
import GlobalNav from "./components/GlobalNav";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = ReactDOM.createRoot(document.getElementById("root"));
const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <Error />
	},
	{
		path: "/favorite",
		element: <Favorite />,
		errorElement: <Error />
	}
]);
//tanstack/react-query의 QueryClient 인스턴스 생성
const queryClient = new QueryClient();

// 서비스 워커 등록
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("/service-worker.js")
			.then((registration) => {
				console.log("ServiceWorker registration successful with scope: ", registration.scope);
			})
			.catch((error) => {
				console.log("ServiceWorker registration failed: ", error);
			});
	});
}
// Notification 권한 요청
Notification.requestPermission().then((permission) => {
	if (permission === "granted") {
		new Notification("bang-on", {
			body: "알림 권한이 허용되었습니다.",
			icon: "/logo192.png"
		});
	} else {
		window.alert(
			"방송알림을 받으려면 알림권한이 필요합니다\n앱설정에서 사용중인 브라우저의 알림과\n브라우저 설정에서 이 사이트에대한 알림 허용을 혀용해주세요"
		);
	}
});

root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<GlobalNav />
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
