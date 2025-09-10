import { useEffect, useState } from "react";
import Markdown from "react-markdown";
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
	const { message, error } = useTriggerStream(runId, token, afterStreaming);
	const [loadingText, setLoadingText] = useState("Searching...");
	const [hasFinished, setHasFinished] = useState(false);

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
		let timeoutId: NodeJS.Timeout;

		const updateLoadingText = () => {
			if (!message && !error && !hasFinished) {
				setLoadingText(loadingMessages[currentIndex]);
				currentIndex = (currentIndex + 1) % loadingMessages.length;
				delay = Math.min(delay * 1.2, 4000);
				timeoutId = setTimeout(updateLoadingText, delay);
			}
		};

		if (!hasFinished) {
			timeoutId = setTimeout(updateLoadingText, delay);
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [message, error, hasFinished]);

	useEffect(() => {
		if (error) {
			setHasFinished(true);
		}
	}, [error]);

	useEffect(() => {
		if (message) {
			const finishTimer = setTimeout(() => {
				setHasFinished(true);
			}, 3000);
			return () => clearTimeout(finishTimer);
		}
	}, [message]);

	const showNoResults = hasFinished && !message && !error;

	console.log(message);
	return (
		<div className="streaming-search-container">
			<div className="streaming-search-content">
				{message && <Markdown>{message}</Markdown>}
				{!message && !error && !hasFinished && (
					<div className="streaming-search-loading">
						{loadingText}
					</div>
				)}
				{showNoResults && (
					<div className="streaming-search-no-results">
						No results found for this content.
					</div>
				)}
			</div>
		</div>
	);
};
