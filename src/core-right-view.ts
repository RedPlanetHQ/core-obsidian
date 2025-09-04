import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { CorePanel } from "./core-panel";
import { CORE_VIEW_ICON, CORE_VIEW_NAME, CORE_VIEW_TYPE } from "./constants";
import ky from "ky";

type QueryState = {
	loading: boolean;
	error?: string;
	id?: string;
	token?: string;
	lastQueryKey?: string;
};

export class CoreRightView extends ItemView {
	private root?: ReactDOM.Root;
	private state: QueryState = { loading: false };
	private endpoint = "";
	private apiKey = "";

	constructor(
		leaf: WorkspaceLeaf,
		opts: { endpoint: string; apiKey: string }
	) {
		super(leaf);
		this.endpoint = opts.endpoint;
		this.apiKey = opts.apiKey;
	}

	getViewType() {
		return CORE_VIEW_TYPE;
	}
	getDisplayText() {
		return CORE_VIEW_NAME;
	}
	getIcon(): string {
		return CORE_VIEW_ICON;
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1] as HTMLElement;
		const host = container.createDiv({ cls: "core-panel-host" });
		this.root = ReactDOM.createRoot(host);
		this.render();
	}

	async onClose(): Promise<void> {
		this.root?.unmount();
	}

	updateConfig(endpoint: string, apiKey: string) {
		this.endpoint = endpoint;
		this.apiKey = apiKey;
	}

	render() {
		this.root?.render(
			React.createElement(CorePanel, {
				loading: this.state.loading,
				error: this.state.error,
				id: this.state.id,
				token: this.state.token,
				onRefresh: () => this.refreshFromActiveNote(),
			})
		);
	}

	async refreshFromActiveNote() {
		const file = this.app.workspace.getActiveFile();
		if (!file || file.extension !== "md") {
			this.state = {
				loading: false,
				id: undefined,
				token: undefined,
				error: undefined,
			};
			return this.render();
		}
		const content = await this.app.vault.read(file);
		const queryKey = `${file.path}:${file.stat.mtime}`;
		if (this.state.lastQueryKey === queryKey) return;

		this.state = {
			...this.state,
			loading: true,
			error: undefined,
			lastQueryKey: queryKey,
		};
		this.render();

		try {
			const res = await ky
				.post(`${this.endpoint}/api/v1/extension-search`, {
					json: {
						input: content,
					},
					headers: { Authorization: `Bearer ${this.apiKey}` },
					timeout: 10_000,
					retry: { limit: 2 },
				})
				.json();

			const data = (res ?? {}) as {
				id: string;
				publicAccessToken: string;
			};
			this.state = {
				loading: false,
				id: data.id,
				token: data.publicAccessToken,
				error: undefined,
				lastQueryKey: queryKey,
			};
		} catch (e) {
			this.state = {
				loading: false,
				id: undefined,
				token: undefined,
				error: e?.message ?? "Request failed",
				lastQueryKey: queryKey,
			};
		}
		this.render();
	}
}
