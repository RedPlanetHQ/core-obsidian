import { useEffect, useState } from "react";

import { useTriggerStream } from "./use-trigger-stream";

interface StreamingSearchProps {
	runId: string;
	token: string;
	afterStreaming: () => void;
	onInsert?: (content: string) => void;
}

export const StreamingSearch = ({
	runId,
	token,
	afterStreaming,
	onInsert,
}: StreamingSearchProps) => {
	const { message } = useTriggerStream(runId, token, afterStreaming);
	const [loadingText, setLoadingText] = useState("Searching...");

	const loadingMessages = [
		"Searching...",
		"Finding relevant information...",
		"Analyzing context...",
		"Gathering results...",
		"Processing matches...",
		"Compiling information...",
		"Almost ready...",
	];

	useEffect(() => {
		let currentIndex = 0;
		let delay = 2000;

		const updateLoadingText = () => {
			if (!message) {
				setLoadingText(loadingMessages[currentIndex]);
				currentIndex = (currentIndex + 1) % loadingMessages.length;
				delay = Math.min(delay * 1.2, 4000);
				setTimeout(updateLoadingText, delay);
			}
		};

		const timer = setTimeout(updateLoadingText, delay);

		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [message]);

	return (
		<div
			style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "0.25rem",
					marginTop: "10px",
				}}
			>
				{message ? (
					<>{message}</>
				) : (
					<div
						style={{
							color: "var(--text-foreground)",
							fontStyle: "italic",
						}}
					>
						{loadingText}
					</div>
				)}
			</div>
		</div>
	);
};
