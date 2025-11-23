export type ProjectItem = {
	title: string;
	description: string;
	image: string;
	link: string;
	tags: string[];
};

export const projects: ProjectItem[] = [
	{
		title: "Alcove",
		description:
			"RSS and blogs pose to be a solution for freedom speech, however RSS readers with sync capabilities often result in a 'wont be evil' promise in regards to privacy of what you read. Alcove brings a 'cant be evil' tech stack to the table. This app uses Evolu to enable end to end encrption for reading RSS feeds while giving people the ability to sync their reader across multiple devices.",
		image: "https://alcove.tools/og.png",
		link: "https://stevedylan.dev/posts/introducing-alcove/",
		tags: ["blogging", "privacy", "rss"],
	},
	{
		title: "BlogFeeds.net",
		description:
			"I've personally found the potential of using blogs, rss, and feeds as a replacment for social media. This website is a simple static site that promotes the idea and includes an FreshRSS API proxy to feature people who have the same philosophy and include a feeds page on their blog.",
		image: "https://blogfeeds.net/og.png",
		link: "https://blogfeeds.net",
		tags: ["social networking", "blogging"],
	},
	{
		title: "Sipp",
		description:
			"A minimal code sharing app that runs purely on Bun with native html css js and sqlite. It's designed to be self hosted by developers so they have a space under their own domain where they can have snippets created and shared under their control, with the ability to customize the experience thanks to the simplicity of the structure.",
		image: "https://sipp.so/assets/og.png",
		link: "https://sipp.so",
		tags: ["developer tools", "productivity"],
	},
	{
		title: "norns",
		description:
			"Over the years I've noticed how so many decentralized applications on EVM chains have slowly built up heavy dependency trees. With some of the supplychain hacks occurring on NPM, I decided it would be a good idea to build atomic web components that achieve all the basic functionality needed to build dApps. The result was norns, which is a library + CLI for simple EVM UI components. Much like shadcn/ui you can import the raw code to your framework or vanilla HTML file and they won't ever break since they have zero dependencies or base framework; just JavaScript.",
		image: "https://norns.so/og.png",
		link: "https://norns.so",
		tags: ["blockchain", "developer tools", "web frameworks"],
	},
	{
		title: "Orbiter",
		description:
			"In a world full of complicated CI/CD pipelines there's a desire for a simpler solution for hosting static websites. Orbiter is a service that does just that, letting people upload and create a static site in 30 seconds. It's currently being built by Steve along side Justin Hunter and feautes an open platform approach using IPFS and blockchain.",
		image: "https://orbiter.host/og.png",
		link: "https://orbiter.host",
		tags: ["ipfs", "blockchain", "developer tools"],
	},
	{
		title: "bhvr",
		description:
			"I stopped using Next.js and Vercel a while ago due to the amount of vendor lock-in the stack introduced. As an alternative I started using a combination of a Vite + React frontend with a Hono backend. I was setting up separate repos so many times I decided to turn it into a monorepo using Bun. bhvr is a simple barebones template that helps people setup their own project with the same stack, featuring a shared package folder for types that can be used in both server and client. More importantly, each piece can easily be pulled out from one hosting provider and used in another, making it portable and independent.",
		image: "https://bhvr.dev/og.png",
		link: "https://bhvr.dev",
		tags: ["developer tools", "web frameworks"],
	},
	{
		title: "Darkmatter",
		description:
			"I got tired of seeing so many developer use terminal emulators that required a login or had paywalls, so I put together a quickstart terminal build using Ghostty. The result is a great DX with all the tools you need, and setting you up to customize it yourself. It also brought about a new theme under the same name, which has been ported to Neovim and Zed if you're interested.",
		image: "https://files.stevedylan.dev/darkmatter-nvim.png",
		link: "https://github.com/stevedylandev/darkmatter",
		tags: ["developer tools", "neovim", "terminal"],
	},
	{
		title: "Atlas",
		description:
			"A simple yet powerful CLI for ENS queries and utilities. Can resolve different types of records for names or addresses, as well as provide a printed profile, hashes, or ENS contract deployments",
		image:
			"https://raw.githubusercontent.com/stevedylandev/atlas/main/cover.png",
		link: "https://github.com/stevedylandev/atlas",
		tags: ["developer tools", "ens", "blockchain"],
	},
	{
		title: "IPCM",
		description:
			"IPCM (InterPlanetary CID Mapping) is a blockchain approach to solving the problem of dynamic IPFS data. Instead of using a slower solution like IPNS to point to new content, IPCM is a smart contract that is used as the source of truth for a piece of dynamic content. It features a simple state that can only be updated by the owner of the contract but read by anyone, as well as a public version history through Solidity events.",
		image:
			"https://files.stevedylan.dev/bafkreigsap637s5qtmp2cqomi3tkjlz62pet35x3cfbjqzh7mmbioiooei.jpg",
		link: "https://ipcm.dev",
		tags: ["blockchain", "ipfs", "developer tools"],
	},
	{
		title: "GitCast",
		description:
			"A Farcaster Mini App that merges the GitHub event feed into the Farcaster social graph. Warpcast created an API that exposed the GitHub verifications made by all users and I thought it would be fun to see a feed GitHub events for all the people I follow that have the verification. Only problem was the number was in the 40K+ range which was too many to filter through. To solve this I built a fairly complex backend that indexes for each user that wants to see their feed and stores the users who have the verifications as well as their events. This was a great exercise in optimizing data pipelines and uses a mix of Cloudflare workers, KVs, D1 database, and queues.",
		image: "https://gitcast.dev/og.png",
		link: "https://github.com/stevedylandev/gitcast-server",
		tags: ["farcaster", "social"],
	},
	{
		title: "Mast",
		description:
			"A simple TUI used for sending casts on Farcaster written in Go. I wanted a project to try out the Bubbletea TUI framework from Charm.sh and this fit the bill perfectly. It's authorized using your own custody signers (can be created through castkeys.xyz) and allows the user to set their own Farcaster hub.",
		image:
			"https://cdn.stevedylan.dev/files/bafkreicb5ravot4fg6cvjmasp7l4n3c5x26lpejefx5mx6byubcq4oib4y",
		link: "https://github.com/stevedylandev/mast-cli",
		tags: ["farcaster", "developer tools"],
	},
	{
		title: "Cast Keys",
		description:
			"A tool and example for Farcaster developers that need to create signers for their account. Signers are ED25519 keypair that are signed by the primary wallet of a user, and they operate like API keys that can be revoked down the road. They are crucial to the Farcaster ecosystem as they allow users to 'sign-in' to other Farcaster apps and interact with the protocol. This small web app makes it easy to generate a signer for your account, but the code is also FOSS as an educational tool for new Farcaster devs.",
		image:
			"https://raw.githubusercontent.com/stevedylandev/cast-keys/refs/heads/main/public/og.png",
		link: "https://github.com/stevedylandev/cast-keys",
		tags: ["farcaster", "developer tools"],
	},
	{
		title: "Pi-Widget",
		description:
			"A small server written in Go that you can run on your Raspberry Pi to display vitals in real time. For my particular Pi it displays IPFS repo stats and system stats, with more updates on the way",
		image: "https://stevedylan.dev/pi.png",
		link: "https://github.com/stevedylandev/pi-widget",
		tags: ["hardware", "ipfs", "raspberry pi"],
	},
	{
		title: "Radicalize",
		description:
			"A CLI written in Go that can help migrate existing local or remote git repos to Radicle.xyz",
		image:
			"https://files.stevedylan.dev/QmUFwBiweWHtGBxftQ7xNpiS5xSBHJyZJgsHXXGRy2qyLH.webp",
		link: "https://github.com/stevedylandev/radicalize",
		tags: ["developer tools", "radicle", "git"],
	},
	{
		title: "Snippets",
		description:
			"I was tired of poor code sharing experiences like Pastebin that were littered with ads, and I really loved the experience of Ray.so for images. This led to the creation of Snippets.so, an open sourced and extensible code sharing solution that’s minimal and clean.",
		image:
			"https://raw.githubusercontent.com/stevedylandev/snippets/refs/heads/main/public/og.png",
		link: "https://github.com/stevedylandev/snippets",
		tags: ["developer tools", "ipfs", "productivity"],
	},
	{
		title: "Pinata SDK",
		description:
			"The original Pinata SDK was written for Node.js years ago, and as the developer ecosystem evolved a more flexible SDK was necessary. This project was a full typescript rewrite from scratch that includes a whole new developer experience that intuitive, with far more methods and capabilities than before.",
		image:
			"https://files.stevedylan.dev/bafkreidv5iptnieh6eijei7enqc4mdhxpte3ries23heqf7s2hu3gdu6ru.jpg",
		link: "https://docs.pinata.cloud/pinata",
		tags: ["developer tools", "ipfs"],
	},
	{
		title: "Raycaster Extension",
		description:
			"The fastest way to send a cast on Farcaster. A Raycast extension that allows you to sign into your Farcaster account and send casts with optional images via IPFS. ",
		image:
			"https://files.stevedylan.dev/QmSsY6QnhdwbWunrgzTDkpvRd7oWx5nUp8v7UiMeGRFeZ1.png",
		link: "https://www.raycast.com/stevedylandev/raycaster",
		tags: ["raycast", "developer tools", "productivity"],
	},
	{
		title: "Cosmic Cowboys",
		description:
			"This was a hackathon project that I worked on with two coworkers during EthOnline 2023. The goal was to build a blockchain game that used AI NPCs with ERC-6551. I handled all the smart contract work and bits and pieces of the web app. Overall we had a pretty unique experience and glimpse into the future of gaming, and it was chosen as a finalist project.",
		image:
			"https://assets-global.website-files.com/659ed44e11fabf4e65eb47eb/65a5616eb13e9f94a0f04806_img-open-graph-homepage.png",
		link: "https://ethglobal.com/showcase/cosmic-cowboys-3q0co",
		tags: ["blockchain", "ai", "ipfs"],
	},
	{
		title: "Pinata IPFS CLI",
		description:
			"A Go rewrite of the Node.js CLI for Pinata, allows fast and extensive uploads to Pinata. Also includes helpful features for listing files and other API functionalities. ",
		image:
			"https://files.stevedylan.dev/QmNcdx9t48z7RQUXUZZHmuc4zBfyBxKLjDfEgmfhiop7j7.webp",
		link: "https://github.com/PinataCloud/ipfs-cli",
		tags: ["developer tools", "ipfs"],
	},
];
