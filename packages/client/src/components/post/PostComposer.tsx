import { useState } from "react";
import { useAuth } from "../auth/AuthStatus";

const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.stevedylan.dev";
const MAX_LENGTH = 300;

interface PostComposerProps {
	onPostCreated?: () => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
	const { authenticated } = useAuth();
	const [text, setText] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	if (!authenticated) {
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!text.trim()) {
			setError("Post cannot be empty");
			return;
		}

		if (text.length > MAX_LENGTH) {
			setError(`Post must be ${MAX_LENGTH} characters or less`);
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
				body: JSON.stringify({ text: text.trim() }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create post");
			}

			setText("");
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);

			// Notify parent to refresh posts
			onPostCreated?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create post");
		} finally {
			setIsSubmitting(false);
		}
	};

	const remaining = MAX_LENGTH - text.length;
	const isOverLimit = remaining < 0;

	return (
		<form
			onSubmit={handleSubmit}
			className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
		>
			<label htmlFor="post-text" className="block text-sm font-medium mb-2">
				New Update
			</label>
			<textarea
				id="post-text"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="What's happening?"
				rows={3}
				className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-800 resize-none focus:outline-none text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				disabled={isSubmitting}
			/>

			<div className="flex items-center justify-between mt-3">
				<div className="flex items-center gap-3">
					<span
						className={`text-sm ${isOverLimit ? "text-red-500" : remaining <= 20 ? "text-yellow-500" : "text-gray-500"}`}
					>
						{remaining}
					</span>

					{error && <span className="text-sm text-red-500">{error}</span>}

					{success && (
						<span className="text-sm text-green-500">Posted successfully!</span>
					)}
				</div>

				<button
					type="submit"
					disabled={isSubmitting || isOverLimit || !text.trim()}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? "Posting..." : "Post"}
				</button>
			</div>
		</form>
	);
}
