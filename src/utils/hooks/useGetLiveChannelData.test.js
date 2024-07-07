import { renderHook, waitFor } from "@testing-library/react";
import useGetLiveChannelData from "./useGetLiveChannelData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

test("useGetLiveChannelData 후크가 알맞은 형태의 객체를 반환하는가?", async () => {
	// QueryClient 인스턴스 생성
	const queryClient = new QueryClient();

	// 커스텀 후크를 QueryClientProvider로 래핑하는 래퍼 컴포넌트 생성
	const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	const { result } = renderHook(() => useGetLiveChannelData("봄"), { wrapper });

	await waitFor(
		() =>
			// 결과가 업데이트될 때까지 대기await waitFor(() => {
			expect(result.current.isSuccess).toBe(true),
		{ timeout: 9000 }
	);

	//값은 상관없이 구조만 일치하는지 확인
	const expectedStructure = {
		id: expect.anything(),
		name: expect.anything(),
		imageUrl: expect.anything(),
		liveTitle: expect.anything(),
		liveImageUrl: expect.anything(),
		openDate: expect.anything(),
		viewCount: expect.anything(),
		isAdult: expect.anything(),
		tags: expect.anything(),
		liveCategory: expect.anything(),
		liveUrl: expect.anything(),
		platform: expect.anything()
	};
	// 결과 데이터 출력
	//console.log(result.current.queriesResults);
	expect(result.current.queriesResults).toEqual(expect.arrayContaining([expect.objectContaining(expectedStructure)]));
}, 10000);
