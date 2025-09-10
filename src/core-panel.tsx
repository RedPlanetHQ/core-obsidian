import { StreamingSearch } from "./streaming-search";

export type CoreHit = { title: string; snippet?: string; url?: string };

export function CorePanel(props: {
	loading: boolean;
	error?: string;
	id?: string;
	token?: string;
	onRefresh: () => void;
}) {
	const { loading, error, id, token, onRefresh } = props;

	return (
		<div className="core-panel-container">
			<div className="core-panel-header">
				<h3 className="core-panel-title">CORE Results</h3>
				<button className="core-refresh-button" onClick={onRefresh}>
					↻
				</button>
			</div>
			
			{loading && <div className="core-loading">Searching…</div>}
			{error && <div className="core-panel-error">Error: {error}</div>}
			
			{!loading && !error && (!id || !token) && (
				<div className="core-no-results">No results yet. Open a note or edit to trigger search.</div>
			)}

			{!loading && !error && id && token && (
				<StreamingSearch
					runId={id}
					token={token}
					afterStreaming={() => {}}
				/>
			)}
		</div>
	);
}
