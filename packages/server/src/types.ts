export interface BlobRef {
	$link: string;
}

export interface ImageEmbed {
	image: {
		ref: BlobRef;
	};
	alt?: string;
}

export interface PostEmbed {
	$type: string;
	images?: ImageEmbed[];
}

export interface PostValue {
	text: string;
	createdAt: string;
	embed?: PostEmbed;
	reply?: PostRecord;
}

export interface PostRecord {
	uri: string;
	value: PostValue;
}

export interface ListRecordsResponse {
	records: PostRecord[];
}
