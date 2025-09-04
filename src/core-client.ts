import ky from "ky";

import * as crypto from "crypto";
import { Payload } from "./types";

// input: file path (string), plus maybe createdAt (number)
// output: stable sessionId (base64url hash)
export function getDocumentId(path: string, createdAt: number): string {
	const seed = `${path}|${createdAt}`;
	const digest = crypto.createHash("sha256").update(seed).digest("base64");

	// convert to base64url (no +, /, or =)
	return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export class CoreClient {
	constructor(private cfg: { endpoint: string; apiKey: string }) {}
	async ingest(payload: Payload) {
		if (!this.cfg.endpoint) throw new Error("No CORE endpoint configured");

		const episode = {
			episodeBody: payload.episode.content.replace("core.sync: true", ""),
			referenceTime: new Date(payload.episode.updatedAt).toISOString(),
			source: "OBSIDIAN",
			sessionId: getDocumentId(
				payload.episode.path,
				payload.episode.createdAt
			),
			type: "DOCUMENT",
		};

		return ky
			.post(`${this.cfg.endpoint}/api/v1/add`, {
				json: episode,
				headers: { Authorization: `Bearer ${this.cfg.apiKey}` },
				timeout: 10_000,
				retry: { limit: 2 },
			})
			.json();
	}
}
