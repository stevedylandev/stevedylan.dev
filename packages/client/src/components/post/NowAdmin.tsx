import { AuthProvider, LoginButton } from "../auth/AuthStatus";
import { PostComposer } from "./PostComposer";

declare global {
	interface Window {
		fetchPosts?: () => Promise<void>;
	}
}

export function NowAdmin() {
	const handlePostCreated = () => {
		// Call the global fetchPosts function to refresh the posts list
		if (typeof window !== "undefined" && window.fetchPosts) {
			window.fetchPosts();
		}
	};

	return (
		<AuthProvider>
			<div className="mb-6">
				<div className="flex justify-end mb-4">
					<LoginButton />
				</div>
				<PostComposer onPostCreated={handlePostCreated} />
			</div>
		</AuthProvider>
	);
}
