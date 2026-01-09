import { useState } from "react";
import { useAuth } from "../auth/AuthStatus";

const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.stevedylan.dev";
const MAX_TITLE_LENGTH = 128;
const SITE_URL = "https://stevedylan.dev";

interface PostComposerProps {
	onPostCreated?: () => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
	const { authenticated } = useAuth();
	const [title, setTitle] = useState("");
	const [path, setPath] = useState("");
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	if (!authenticated) {
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) {
			setError("Title is required");
			return;
		}

		if (title.length > MAX_TITLE_LENGTH) {
			setError(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
			return;
		}

		if (!content.trim()) {
			setError("Content is required");
			return;
		}

		setIsSubmitting(true);
		setError(null);
		setSuccess(false);

		try {
			const response = await fetch(`${API_URL}/now/post`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: title.trim(),
					path: path.trim() ? (path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`) : undefined,
					content: content.trim(),
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create document");
			}

			setTitle("");
			setPath("");
			setContent("");
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);

			// Notify parent to refresh posts
			onPostCreated?.();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to create document",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const titleRemaining = MAX_TITLE_LENGTH - title.length;
	const isTitleOverLimit = titleRemaining < 0;

	return (
		<form onSubmit={handleSubmit} className="mb-8 mt-12">
			<label
				htmlFor="document-title"
				className="block text-sm font-medium mb-2"
			>
				New Document
			</label>

			{/* Title Field */}
			<div className="mb-4">
				<label htmlFor="title" className="block text-xs font-medium mb-1">
					Title *
				</label>
				<input
					id="title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Document title"
					className="w-full bg-transparent p-3 border border-white text-white"
					disabled={isSubmitting}
				/>
				<span
					className={`text-xs ${isTitleOverLimit ? "text-red-500" : titleRemaining <= 20 ? "text-yellow-500" : "text-gray-500"}`}
				>
					{titleRemaining} characters remaining
				</span>
			</div>

			{/* Path Field */}
			<div className="mb-4">
				<label htmlFor="path" className="block text-xs font-medium mb-1">
					Path
				</label>
				<div className="flex items-center gap-2">
					<input
						id="path"
						type="text"
						value={path}
						onChange={(e) => setPath(e.target.value)}
						placeholder="custom-slug"
						className="flex-1 bg-transparent p-3 border border-white text-white"
						disabled={isSubmitting}
					/>
				</div>
			</div>

			{/* Content Field */}
			<div className="mb-4">
				<label htmlFor="content" className="block text-xs font-medium mb-1">
					Content (Markdown) *
				</label>
				<textarea
					id="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Write your content in markdown..."
					rows={10}
					className="w-full bg-transparent p-3 border border-white text-white font-mono text-sm"
					disabled={isSubmitting}
				/>
			</div>

			<div className="flex items-center justify-between mt-3">
				<div className="flex items-center gap-3">
					{error && <span className="text-sm text-red-500">{error}</span>}

					{success && (
						<span className="text-sm">Document published successfully!</span>
					)}
				</div>

				<button
					type="submit"
					disabled={
						isSubmitting || isTitleOverLimit || !title.trim() || !content.trim()
					}
					className="px-4 py-2 border-white border text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? "Publishing..." : "Publish"}
				</button>
			</div>
		</form>
	);
}
