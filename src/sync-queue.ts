import { App, TAbstractFile } from "obsidian";

export class SyncQueue {
	private key = "core-sync-queue";
	constructor(
		private app: App,
		private client: { ingest: (p: any) => Promise<any> }
	) {}

	enqueue(item: any) {
		const q = this.read();
		q.push({ item, ts: Date.now() });
		this.write(q);
	}
	async flushLater() {
		setTimeout(() => this.flush().catch(() => {}), 3000);
	}

	async flush() {
		const q = this.read();
		const remain: any[] = [];
		for (const entry of q) {
			try {
				await this.client.ingest(entry.item);
			} catch {
				remain.push(entry);
			}
		}
		this.write(remain);
	}

	private read() {
		return JSON.parse(localStorage.getItem(this.key) ?? "[]");
	}

	private write(q: any[]) {
		localStorage.setItem(this.key, JSON.stringify(q));
	}
}
