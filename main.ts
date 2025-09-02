// main.ts
import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	Notice,
	TFile,
	CachedMetadata,
} from "obsidian";
import { CoreClient } from "./src/core-client";
import { SyncQueue } from "./src/sync-queue";

interface CoreSyncSettings {
	endpoint: string; // e.g., http://localhost:4000/mcp/memory/ingest
	apiKey: string;
	autoSyncOnModify: boolean;
}

const DEFAULT_SETTINGS: CoreSyncSettings = {
	endpoint: "",
	apiKey: "",
	autoSyncOnModify: false,
};

export default class CoreSyncPlugin extends Plugin {
	settings: CoreSyncSettings;
	client!: CoreClient;
	queue!: SyncQueue;

	async onload() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		this.client = new CoreClient(this.settings);
		this.queue = new SyncQueue(this.app, this.client);

		this.addSettingTab(new CoreSyncSettingTab(this.app, this));

		this.addCommand({
			id: "core-sync-current-note",
			name: "Sync current note to CORE",
			callback: async () => {
				const file = this.app.workspace.getActiveFile();
				if (file) await this.syncFile(file);
			},
		});

		this.addCommand({
			id: "core-sync",
			name: "Sync all notes with core.sync=true",
			callback: async () => this.syncAllMarkedNotes(),
		});

		this.registerEvent(
			this.app.vault.on("modify", async (f) => {
				console.log("modified");
				if (!(f instanceof TFile) || !this.settings.autoSyncOnModify)
					return;
				await this.syncFile(f);
			})
		);

		// try to flush any queued items on startup
		this.queue.flushLater();
	}

	async syncFile(file: TFile) {
		const cache = this.app.metadataCache.getFileCache(file);
		const fm = cache?.frontmatter ?? {};
		const shouldSync =
			fm["core.sync"] === true || fm["core.sync"] === "true";

		if (!shouldSync) {
			new Notice("CORE: skipping (core.sync not enabled)");
			return;
		}

		const content = await this.app.vault.read(file);
		const payload = buildCorePayload({ file, cache, content });

		try {
			await this.client.ingest(payload);
			new Notice("CORE: synced ✅");
		} catch (e) {
			this.queue.enqueue(payload); // offline/failed → retry later
			new Notice("CORE: queued for retry ⚠️");
		}
	}

	async syncAllMarkedNotes() {
		const files = this.app.vault.getMarkdownFiles();
		const toSync: TFile[] = [];
		for (const f of files) {
			const fm =
				this.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
			if (fm["core.sync"] === true || fm["core.sync"] === "true")
				toSync.push(f);
		}
		for (const f of toSync) await this.syncFile(f);
		new Notice(`CORE: scheduled ${toSync.length} files`);
	}

	async onunload() {
		await this.saveData(this.settings);
	}
}

function buildCorePayload(args: {
	file: TFile;
	cache?: CachedMetadata | null;
	content: string;
}) {
	const { file, cache, content } = args;
	const title = file.basename;
	const createdAt = file.stat.ctime;
	const updatedAt = file.stat.mtime;

	// example mapping → Episodes + Facts
	return {
		episode: {
			source: "Obsidian",
			path: file.path,
			createdAt,
			updatedAt,
			links: (cache?.links ?? []).map((l) => l.link),
			content: `${title}\n\n${content}`, // raw markdown (optionally strip frontmatter)
		},
	};
}

class CoreSyncSettingTab extends PluginSettingTab {
	plugin: CoreSyncPlugin;
	constructor(app: App, plugin: CoreSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName("CORE Endpoint").addText((t) =>
			t
				.setPlaceholder("https://core.heysol.ai")
				.setValue(this.plugin.settings.endpoint)
				.onChange(async (v) => {
					this.plugin.settings.endpoint = v;
					await this.plugin.saveData(this.plugin.settings);
				})
		);

		new Setting(containerEl).setName("API Key").addText((t) =>
			t
				.setPlaceholder("rc-pat-...")
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (v) => {
					this.plugin.settings.apiKey = v;
					await this.plugin.saveData(this.plugin.settings);
				})
				.inputEl.setAttribute("type", "password")
		);

		new Setting(containerEl).setName("Auto sync on modify").addToggle((t) =>
			t
				.setValue(this.plugin.settings.autoSyncOnModify)
				.onChange(async (v) => {
					this.plugin.settings.autoSyncOnModify = v;
					await this.plugin.saveData(this.plugin.settings);
				})
		);
	}
}
