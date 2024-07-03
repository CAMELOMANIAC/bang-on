import { render, screen } from "@testing-library/react";
import App from "./App";
import { QueryClient, QueryClientProvider } from "react-query";
import userEvent from "@testing-library/user-event";

// test("검색어 필드가 존재하는가?", () => {
// 	const queryClient = new QueryClient();

// 	render(
// 		//<App />은 react-query기능을 사용하고 있고 테스트 하기 위해 독립적으로 실행되어야하므로 QueryClientProvider로 감싸줘야함
// 		<QueryClientProvider client={queryClient}>
// 			<App />
// 		</QueryClientProvider>
// 	);
// 	const searchElement = screen.getByLabelText("search");
// 	expect(searchElement).toBeInTheDocument();
// });

test("쿼리 검색 테스트", async () => {
	const queryClient = new QueryClient();
	render(
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	);
	const inputElement = screen.getByLabelText("search");
	await userEvent.type(inputElement, "멀럭");

	const buttonElement = screen.getByText("검색");
	await userEvent.click(buttonElement);
	await screen.findByText("멀럭", undefined, { timeout: 8000 }); //기본 8초정도 걸림 여유값이 필요할 수 있음
}, 10000);
