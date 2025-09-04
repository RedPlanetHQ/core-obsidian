export interface Episode {
	content: string;
	updatedAt: number;
	path: string;
	createdAt: number;
}

export interface Payload {
	episode: Episode;
}
