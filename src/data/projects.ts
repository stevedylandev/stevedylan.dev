import type { ImageMetadata } from "astro";

import bulletsImg from "@assets/projects/bullets.png";
import andromedaImg from "@/assets/projects/andromeda.png";
import scoutImg from "@/assets/projects/scout.png";
import sequoiaImg from "@/assets/projects/sequoia.png";
import alcoveImg from "@/assets/projects/alcove.jpg";
import sippImg from "@/assets/projects/sipp.png";
import parcelsImg from "@/assets/projects/parcels.png";
import feedsImg from "@/assets/projects/feeds.png";
import docsSurfImg from "@/assets/projects/docs-surf.png";
import blogFeedsImg from "@/assets/projects/blogfeeds.png";
import nornsImg from "@/assets/projects/norns.png";
import orbiterImg from "@/assets/projects/orbiter.png";
import bhvrImg from "@/assets/projects/bhvr.png";
import darkmatterImg from "@/assets/projects/darkmatter.png";
import atlasImg from "@/assets/projects/atlas.png";
import ipcmImg from "@/assets/projects/ipcm.jpg";
import piImg from "@/assets/projects/pi.png";
import radicalizeImg from "@/assets/projects/radicalize.webp";
import snippetsImg from "@/assets/projects/snippets.jpg";
import pinataSdkImg from "@/assets/projects/pinata-sdk.jpg";
import cosmicCowboysImg from "@/assets/projects/cosmic-cowboys.png";
import ipfsCliImg from "@/assets/projects/ipfs-cli.webp";

export type ProjectItem = {
	title: string;
	description: string;
	image: ImageMetadata;
	link: string;
	tags: string[];
};

export const projects: ProjectItem[] = [
  {
    title: "Bullets",
    description: "Originally built as a companion to Feeds, Bullets is a minimal RSS TUI that lets you browse feeds. Simply provide a URL, or several, and Bullets will render a list of posts that can be opened in the browser. There is no feed tracking, database, or even marking posts as read or unread. It follows the same minimal philosophy of Feeds where you get a list of posts and you can read them as you wish, or pass in a feed that you may only want to view every now and then.",
    image: bulletsImg,
    link: "https://github.com/stevedylandev/bullets",
    tags: ["blogging", "rss", "tui"]
  },
	{
		title: "Andromeda",
		description:
			"A collection of personal and self hostable software written in Rust. Each app is minimal and focuses on low memory and data usage. Includes common needs like an RSS reader, markdown note taker, even a micro blogging platform. Andromeda also includes a base Rust stack and agent skills that can be used to build more basic web applications.",
		image: andromedaImg,
		link: "https://andromeda.build",
		tags: ["productivity", "self hosting"],
	},
	{
		title: "Scout",
		description:
			"A minimal iOS Gemini Protocol client in SwiftUI. I became really interested in the Gemini Protocol and didn’t like the existing options out there for iOS, so I built my own. Was a good learning experience and thoroughly enjoy the final product. Features things like bookmarks, searching, themes, client certificates, you name it. Currently in the process of publishing to the App Store.",
		image: scoutImg,
		link: "https://github.com/stevedylandev/Scout",
		tags: ["privacy", "networking"],
	},
	{
		title: "Sequoia",
		description:
			"While there are several blogging platform options for publishing standard.stie lexicons, there wasn’t much out there for self-hosted blogs. This prompted me to build Sequoia: a CLI that helps take existing blogs and publish them to ATProto. It features an interactive setup, flexible config to meet any SSG or framework, and even the necessary pieces for verification of standard.site lexicons.",
		image: sequoiaImg,
		link: "https://sequoia.pub",
		tags: ["blogging", "atproto", "standard site", "cli"],
	},
	{
		title: "Alcove",
		description:
			"RSS and blogs pose to be a solution for freedom speech, however RSS readers with sync capabilities often result in a ‘wont be evil’ promise in regards to privacy of what you read. Alcove brings a ‘cant be evil’ tech stack to the table. This app uses Evolu to enable end to end encrption for reading RSS feeds while giving people the ability to sync their reader across multiple devices.",
		image: alcoveImg,
		link: "https://stevedylan.dev/posts/introducing-alcove/",
		tags: ["blogging", "privacy", "rss"],
	},
	{
		title: "Sipp",
		description:
			"Minimal code sharing app for the web and the terminal, written in Rust. A single ~13MB binary contains a web server, TUI, and CLI. Easy to self host and access through your browser or your terminal. Loads of features such as syntax highlighting, config to authenticated selected endpoints, and CLI actions to quickly create snippets from files.",
		image: sippImg,
		link: "https://andromeda.build/apps/sipp",
		tags: ["developer tools", "productivity", "self hosting"],
	},
	{
		title: "Parcels",
		description:
			"A minimal package tracking app written in Rust, designed to be self hosted for personal use.",
		image: parcelsImg,
		link: "https://andromeda.build/apps/parcels",
		tags: ["productivity", "self hosting"],
	},
	{
		title: "Feeds",
		description:
			"A minimal take on an RSS reader, Feeds lets you pull from multiple sources of feeds including URL query params, OPML files, and FreshRSS. Instead of rendering the post, Feeds simply gives you a feed link so you can view the content in its original context. Feeds is also designed to be simple and easy to self host for your own use cases.",
		image: feedsImg,
		link: "https://andromeda.build/apps/feeds",
		tags: ["blogging", "rss", "self hosted"],
	},
	{
		title: "Docs.surf",
		description:
			"I’ve slowly been falling into ATProto and what it can enable for publishing content on the web, and building a more open web in general. With ATProto you can create records on your server (PDS) that have specific structures known as lexicons. One in particular that is taking of is standard.site. There are two lexicons, Publications and Documents. Both are designed for building interoperable blog posts that can be aggregated. That’s exactly what Docs.surf does, using a mixture of Tap (ATProtos indexer), Cloudflare workers, queues, and D1 databases.",
		image: docsSurfImg,
		link: "https://docs.surf",
		tags: ["blogging", "atproto", "social networking"],
	},
	{
		title: "BlogFeeds.net",
		description:
			"I’ve personally found the potential of using blogs, rss, and feeds as a replacment for social media. This website is a simple static site that promotes the idea and includes an FreshRSS API proxy to feature people who have the same philosophy and include a feeds page on their blog.",
		image: blogFeedsImg,
		link: "https://blogfeeds.net",
		tags: ["social networking", "blogging"],
	},
	{
		title: "norns",
		description:
			"Over the years I’ve noticed how so many decentralized applications on EVM chains have slowly built up heavy dependency trees. With some of the supplychain hacks occurring on NPM, I decided it would be a good idea to build atomic web components that achieve all the basic functionality needed to build dApps. The result was norns, which is a library + CLI for simple EVM UI components. Much like shadcn/ui you can import the raw code to your framework or vanilla HTML file and they won’t ever break since they have zero dependencies or base framework; just JavaScript.",
		image: nornsImg,
		link: "https://norns.so",
		tags: ["blockchain", "developer tools", "web frameworks"],
	},
	{
		title: "Orbiter",
		description:
			"In a world full of complicated CI/CD pipelines there’s a desire for a simpler solution for hosting static websites. Orbiter is a service that does just that, letting people upload and create a static site in 30 seconds. It’s currently being built by Steve along side Justin Hunter and feautes an open platform approach using IPFS and blockchain.",
		image: orbiterImg,
		link: "https://orbiter.host",
		tags: ["ipfs", "blockchain", "developer tools"],
	},
	{
		title: "bhvr",
		description:
			"I stopped using Next.js and Vercel a while ago due to the amount of vendor lock-in the stack introduced. As an alternative I started using a combination of a Vite + React frontend with a Hono backend. I was setting up separate repos so many times I decided to turn it into a monorepo using Bun. bhvr is a simple barebones template that helps people setup their own project with the same stack, featuring a shared package folder for types that can be used in both server and client. More importantly, each piece can easily be pulled out from one hosting provider and used in another, making it portable and independent.",
		image: bhvrImg,
		link: "https://bhvr.dev",
		tags: ["developer tools", "web frameworks"],
	},
	{
		title: "Darkmatter",
		description:
			"I got tired of seeing so many developer use terminal emulators that required a login or had paywalls, so I put together a quickstart terminal build using Ghostty. The result is a great DX with all the tools you need, and setting you up to customize it yourself. It also brought about a new theme under the same name, which has been ported to Neovim and Zed if you’re interested.",
		image: darkmatterImg,
		link: "https://github.com/stevedylandev/darkmatter",
		tags: ["developer tools", "neovim", "terminal"],
	},
	{
		title: "Atlas",
		description:
			"A simple yet powerful CLI for ENS queries and utilities. Can resolve different types of records for names or addresses, as well as provide a printed profile, hashes, or ENS contract deployments",
		image: atlasImg,
		link: "https://github.com/stevedylandev/atlas",
		tags: ["developer tools", "ens", "blockchain"],
	},
	{
		title: "IPCM",
		description:
			"IPCM (InterPlanetary CID Mapping) is a blockchain approach to solving the problem of dynamic IPFS data. Instead of using a slower solution like IPNS to point to new content, IPCM is a smart contract that is used as the source of truth for a piece of dynamic content. It features a simple state that can only be updated by the owner of the contract but read by anyone, as well as a public version history through Solidity events.",
		image: ipcmImg,
		link: "https://ipcm.dev",
		tags: ["blockchain", "ipfs", "developer tools"],
	},
	{
		title: "Pi-Widget",
		description:
			"A small server written in Go that you can run on your Raspberry Pi to display vitals in real time. For my particular Pi it displays IPFS repo stats and system stats, with more updates on the way",
		image: piImg,
		link: "https://github.com/stevedylandev/pi-widget",
		tags: ["hardware", "ipfs", "raspberry pi"],
	},
	{
		title: "Radicalize",
		description:
			"A CLI written in Go that can help migrate existing local or remote git repos to Radicle.xyz",
		image: radicalizeImg,
		link: "https://github.com/stevedylandev/radicalize",
		tags: ["developer tools", "radicle", "git"],
	},
	{
		title: "Snippets",
		description:
			"I was tired of poor code sharing experiences like Pastebin that were littered with ads, and I really loved the experience of Ray.so for images. This led to the creation of Snippets.so, an open sourced and extensible code sharing solution that’s minimal and clean.",
		image: snippetsImg,
		link: "https://snippets.so",
		tags: ["developer tools", "ipfs", "productivity"],
	},
	{
		title: "Pinata SDK",
		description:
			"The original Pinata SDK was written for Node.js years ago, and as the developer ecosystem evolved a more flexible SDK was necessary. This project was a full typescript rewrite from scratch that includes a whole new developer experience that intuitive, with far more methods and capabilities than before.",
		image: pinataSdkImg,
		link: "https://docs.pinata.cloud/sdk",
		tags: ["developer tools", "ipfs"],
	},
	{
		title: "Cosmic Cowboys",
		description:
			"This was a hackathon project that I worked on with two coworkers during EthOnline 2023. The goal was to build a blockchain game that used AI NPCs with ERC-6551. I handled all the smart contract work and bits and pieces of the web app. Overall we had a pretty unique experience and glimpse into the future of gaming, and it was chosen as a finalist project.",
		image: cosmicCowboysImg,
		link: "https://ethglobal.com/showcase/cosmic-cowboys-3q0co",
		tags: ["blockchain", "ai", "ipfs"],
	},
	{
		title: "Pinata IPFS CLI",
		description:
			"A Go rewrite of the Node.js CLI for Pinata, allows fast and extensive uploads to Pinata. Also includes helpful features for listing files and other API functionalities. ",
		image: ipfsCliImg,
		link: "https://github.com/PinataCloud/ipfs-cli",
		tags: ["developer tools", "ipfs"],
	},
];
