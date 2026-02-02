// COMMENTS FUNCTIONALITY DISABLED - Only email reply remains

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
	const emailSubject = encodeURIComponent(`Re: ${postTitle}`);
	const mailtoLink = `mailto:contact@stevedylan.dev?subject=${emailSubject}`;

	return (
		<div className="mt-8 space-y-4">
			<div className="flex gap-3 flex-wrap">
				<a
					href={mailtoLink}
					className="px-2 py-0.5 border border-white hover:border-gray-400 hover:text-gray-400 transition-colors text-xs"
				>
					Reply via Email
				</a>
			</div>
		</div>
	);
}
