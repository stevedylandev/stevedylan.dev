import { useState, useEffect } from "react";

const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.stevedylan.dev";

interface GuestAuthState {
	authenticated: boolean;
	did?: string;
	handle?: string;
	isGuest?: boolean;
	loading: boolean;
}

interface GuestReplyProps {
	atUri: string;
	postTitle: string;
	onReplyPosted?: () => void;
}

export function GuestReply({
	atUri,
	postTitle,
	onReplyPosted,
}: GuestReplyProps) {
	const [authState, setAuthState] = useState<GuestAuthState>({
		authenticated: false,
		loading: true,
	});
	const [replyContent, setReplyContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async () => {
		try {
			const response = await fetch(`${API_URL}/guest-auth/status`, {
				credentials: "include",
			});
			const data = await response.json();
			setAuthState({
				authenticated: data.authenticated,
				did: data.did,
				handle: data.handle,
				isGuest: data.isGuest,
				loading: false,
			});
		} catch (error) {
			console.error("Failed to check auth status:", error);
			setAuthState({ authenticated: false, loading: false });
		}
	};

	const handleLogin = () => {
		// Pass current URL as returnTo parameter
		const currentPath = window.location.pathname;
		window.location.href = `${API_URL}/guest-auth/login?returnTo=${encodeURIComponent(currentPath)}`;
	};

	const handleLogout = async () => {
		try {
			await fetch(`${API_URL}/guest-auth/logout`, {
				method: "POST",
				credentials: "include",
			});
			setAuthState({ authenticated: false, loading: false });
			setReplyContent("");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handleReply = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!replyContent.trim()) {
			setError("Reply content is required");
			return;
		}

		setIsSubmitting(true);
		setError(null);
		setSuccess(false);

		try {
			const response = await fetch(`${API_URL}/now/reply`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					parentUri: atUri,
					content: replyContent.trim(),
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to post reply");
			}

			setReplyContent("");
			setSuccess(true);
			setTimeout(() => setSuccess(false), 5000);

			// Notify parent to refresh replies list
			onReplyPosted?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to post reply");
		} finally {
			setIsSubmitting(false);
		}
	};

	const emailSubject = encodeURIComponent(`Re: ${postTitle}`);
	const mailtoLink = `mailto:contact@stevedylan.dev?subject=${emailSubject}`;

	if (authState.loading) {
		return (
			<div className="mt-8 p-6 border border-gray-700 rounded-lg">
				<p className="text-sm text-gray-400">Loading...</p>
			</div>
		);
	}

	return (
		<div className="mt-8 space-y-4">
			<h2 className="text-xl font-bold">Reply</h2>

			{!authState.authenticated ? (
				<div className="space-y-4">
					<p className="text-sm text-gray-400">
						Sign in with your ATProto account to reply, or send an email.
					</p>
					<div className="flex gap-3 flex-wrap">
						<button
							onClick={handleLogin}
							className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors text-sm"
						>
							Sign in with ATProto
						</button>
						<a
							href={mailtoLink}
							className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors text-sm inline-block"
						>
							Reply via Email
						</a>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-sm text-gray-400">
							Signed in as {authState.handle || authState.did}
						</p>
						<button
							onClick={handleLogout}
							className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
						>
							Sign out
						</button>
					</div>

					<form onSubmit={handleReply} className="space-y-3">
						<textarea
							value={replyContent}
							onChange={(e) => setReplyContent(e.target.value)}
							placeholder="Write your reply..."
							rows={4}
							className="w-full bg-transparent p-3 border border-white text-white resize-none"
							disabled={isSubmitting}
						/>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								{error && <span className="text-sm text-red-500">{error}</span>}
								{success && (
									<span className="text-sm text-green-500">
										Reply posted successfully!
									</span>
								)}
							</div>

							<div className="flex gap-3">
								<a
									href={mailtoLink}
									className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
								>
									or email
								</a>
								<button
									type="submit"
									disabled={isSubmitting || !replyContent.trim()}
									className="px-4 py-2 border border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
								>
									{isSubmitting ? "Posting..." : "Post Reply"}
								</button>
							</div>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
