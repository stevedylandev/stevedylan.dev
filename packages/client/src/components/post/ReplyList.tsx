import { useState, useEffect } from "react";

const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.stevedylan.dev";

interface Author {
	did: string;
	handle: string;
	displayName?: string;
	avatar?: string;
}

interface CommentReference {
	createdAt: string;
	did: string;
	uri: string;
}

interface Reply {
	uri: string;
	cid: string;
	author: Author;
	root: {
		cid: string;
		uri: string;
	};
	parent: {
		cid: string;
		uri: string;
	};
	content: string;
	createdAt: string;
	$type: string;
}

interface ReplyListProps {
	atUri: string;
}

export function ReplyList({ atUri }: ReplyListProps) {
	const [replies, setReplies] = useState<Reply[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchReplies();
	}, [atUri]);

	const fetchReplies = async () => {
		try {
			setLoading(true);
			setError(null);

			const encodedUri = encodeURIComponent(atUri);
			const response = await fetch(`${API_URL}/now/comments/${encodedUri}`);

			if (!response.ok) {
				throw new Error("Failed to fetch comments");
			}

			const data = await response.json();
			setReplies(data.replies || []);
		} catch (err) {
			console.error("Error fetching replies:", err);
			setError(err instanceof Error ? err.message : "Failed to load replies");
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return `${diffInSeconds}s ago`;
		} else if (diffInSeconds < 3600) {
			return `${Math.floor(diffInSeconds / 60)}m ago`;
		} else if (diffInSeconds < 86400) {
			return `${Math.floor(diffInSeconds / 3600)}h ago`;
		} else if (diffInSeconds < 604800) {
			return `${Math.floor(diffInSeconds / 86400)}d ago`;
		} else {
			return date.toLocaleDateString();
		}
	};

	if (loading) {
		return (
			<div className="mt-8">
				<h3 className="text-lg font-bold mb-4">Replies</h3>
				<p className="text-sm text-gray-400">Loading replies...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mt-8">
				<h3 className="text-lg font-bold mb-4">Replies</h3>
				<p className="text-sm text-red-500">{error}</p>
			</div>
		);
	}

	if (replies.length === 0) {
		return (
			<div className="mt-8">
				<h3 className="text-lg font-bold mb-4">Replies</h3>
				<p className="text-sm text-gray-400">
					No replies yet. Be the first to reply!
				</p>
			</div>
		);
	}

	return (
		<div className="mt-8">
			<h3 className="text-lg font-bold mb-4">Replies</h3>
			<div className="space-y-6">
				{replies.map((reply) => (
					<div key={reply.uri}>
						<div className="flex items-start gap-3">
							{reply.author.avatar ? (
								<img
									src={reply.author.avatar}
									alt={reply.author.handle}
									className="w-10 h-10 rounded-full"
								/>
							) : (
								<div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
									<span className="text-gray-400 text-sm">
										{reply.author.handle.charAt(0).toUpperCase()}
									</span>
								</div>
							)}

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="font-semibold text-sm">
										{reply.author.displayName || reply.author.handle}
									</span>
									{reply.author.displayName && (
										<a
											href={`https://pdsls.dev/at://${reply.author.did}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-gray-400 hover:text-gray-300"
										>
											@{reply.author.handle}
										</a>
									)}
									<a
										href={`https://pdsls.dev/${reply.uri}`}
										className="text-xs text-gray-400 hover:text-gray-300"
									>
										{formatDate(reply.createdAt)}
									</a>
								</div>

								<p className="mt-2 text-sm whitespace-pre-wrap break-words">
									{reply.content}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
