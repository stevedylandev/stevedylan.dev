import { useState } from "react";
import { ReplyList } from "./ReplyList";
import { GuestReply } from "./GuestReply";

interface ReplyContainerProps {
	atUri: string;
	postTitle: string;
}

export function ReplyContainer({ atUri, postTitle }: ReplyContainerProps) {
	const [refreshKey, setRefreshKey] = useState(0);

	const handleReplyPosted = () => {
		// Increment key to force ReplyList to re-fetch
		setRefreshKey((prev) => prev + 1);
	};

	return (
		<>
			<ReplyList key={refreshKey} atUri={atUri} />
			<GuestReply
				atUri={atUri}
				postTitle={postTitle}
				onReplyPosted={handleReplyPosted}
			/>
		</>
	);
}
