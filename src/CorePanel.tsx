import * as React from "react";
import { StreamingSearch } from "./streaming-search";

export type CoreHit = { title: string; snippet?: string; url?: string };

export function CorePanel(props: {
	loading: boolean;
	error?: string;
	id?: string;
	token?: string;
	onRefresh: () => void;
}) {
	const { loading, error, id, token } = props;

	if (!id || !token) {
		return (
			<div>No results yet. Open a note or edit to trigger search.</div>
		);
	}

	return (
		<div style={{ padding: "0.5rem", marginBottom: "0.5rem" }}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<h3 style={{ margin: 0 }}>CORE Results</h3>
			</div>
			{loading && <div>Searching…</div>}
			{error && <div style={{ color: "red" }}>Error: {error}</div>}

			<StreamingSearch
				runId={id}
				token={token}
				afterStreaming={() => {}}
			/>
		</div>
	);
}
