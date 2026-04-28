// ATProto configuration
export const OWNER_DID = "did:plc:ia2zdnhjaokf5lazhxrmj6eu";
export const PDS_URL = "https://andromeda.social";

export const MENU_LINKS = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "About",
    path: "/about",
  },
  {
    title: "Blog",
    path: "/posts",
  },
  {
    title: "Projects",
    path: "/projects",
  },
  {
    title: "CV",
    path: "/cv",
  },
  {
    title: "Now",
    path: "/now",
  },
  {
    title: "Feeds",
    path: "/feeds",
  },
  {
    title: "Blogroll",
    path: "/blogroll"
  },
  {
    title: "Library",
    path: "/library",
  },
  {
    title: "Bookmarks",
    path: "/bookmarks",
  },
  {
    title: "Git",
    path: "/git",
  },
  {
    title: "Cellar",
    path: "/cellar",
  },
  {
    title: "Birds",
    path: "/birds",
  },
  {
    title: "EDC",
    path: "/edc",
  },
  {
    title: "Photos",
    path: "https://steve.photo",
  },
  {
    title: "Links",
    path: "/links"
  }
];

export type RssFeed = {
  name: string;
  href: string;
};

export const RSS_FEEDS: RssFeed[] = [
  {
    name: "Blog Posts",
    href: "/rss.xml",
  },
  {
    name: "Now Updates",
    href: "/now/rss.xml",
  },
  {
    name: "Photos",
    href: "https://steve.photo/rss.xml"
  },
  {
    name: "Wine Log",
    href: "https://cellar.stevedylan.dev/feed.xml"
  }
];

export type SocialItem = {
  key: string;
  name: string;
  href: string;
  external?: boolean;
  icon: string;
};

// ! Remember to add your own socials
// *** SVG icons from https://tablericons.com/ ***
export const SOCIAL_ITEMS: SocialItem[] = [
  {
    key: "website",
    name: "Website",
    href: "/",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24m88 104a87.6 87.6 0 0 1-3.33 24h-38.51a157.4 157.4 0 0 0 0-48h38.51a87.6 87.6 0 0 1 3.33 24m-114 40h52a115.1 115.1 0 0 1-26 45a115.3 115.3 0 0 1-26-45m-3.9-16a140.8 140.8 0 0 1 0-48h59.88a140.8 140.8 0 0 1 0 48ZM40 128a87.6 87.6 0 0 1 3.33-24h38.51a157.4 157.4 0 0 0 0 48H43.33A87.6 87.6 0 0 1 40 128m114-40h-52a115.1 115.1 0 0 1 26-45a115.3 115.3 0 0 1 26 45m52.33 0h-35.62a135.3 135.3 0 0 0-22.3-45.6A88.29 88.29 0 0 1 206.37 88Zm-98.74-45.6A135.3 135.3 0 0 0 85.29 88H49.63a88.29 88.29 0 0 1 57.96-45.6M49.63 168h35.66a135.3 135.3 0 0 0 22.3 45.6A88.29 88.29 0 0 1 49.63 168m98.78 45.6a135.3 135.3 0 0 0 22.3-45.6h35.66a88.29 88.29 0 0 1-57.96 45.6"/></svg>`,
  },
  {
    key: "email",
    name: "Email",
    href: "mailto:contact@stevedylan.dev",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 256 256"><path fill="currentColor" d="M224 48H32a8 8 0 0 0-8 8v136a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a8 8 0 0 0-8-8m-96 85.15L52.57 64h150.86ZM98.71 128L40 181.81V74.19Zm11.84 10.85l12 11.05a8 8 0 0 0 10.82 0l12-11.05l58 53.15H52.57ZM157.29 128L216 74.18v107.64Z"/></svg>`,
  },
  {
    key: "rss",
    name: "RSS",
    href: "https://stevedylan.dev/rss.xml",
    external: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 256 256"><path fill="currentColor" d="M106.91 149.09A71.53 71.53 0 0 1 128 200a8 8 0 0 1-16 0a56 56 0 0 0-56-56a8 8 0 0 1 0-16a71.53 71.53 0 0 1 50.91 21.09M56 80a8 8 0 0 0 0 16a104 104 0 0 1 104 104a8 8 0 0 0 16 0A120 120 0 0 0 56 80m118.79 1.21A166.9 166.9 0 0 0 56 32a8 8 0 0 0 0 16a151 151 0 0 1 107.48 44.52A151 151 0 0 1 208 200a8 8 0 0 0 16 0a166.9 166.9 0 0 0-49.21-118.79M60 184a12 12 0 1 0 12 12a12 12 0 0 0-12-12"/></svg>`,
  },
  {
    key: "cv",
    name: "CV",
    href: "/cv",
    external: false,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 256 256"><path fill="currentColor" d="M128 136a8 8 0 0 1-8 8H72a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8m-8-40H72a8 8 0 0 0 0 16h48a8 8 0 0 0 0-16m112 65.47V224a8 8 0 0 1-12 7l-24-13.74L172 231a8 8 0 0 1-12-7v-24H40a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h176a16 16 0 0 1 16 16v30.53a51.88 51.88 0 0 1 0 74.94M160 184v-22.53A52 52 0 0 1 216 76V56H40v128Zm56-12a51.88 51.88 0 0 1-40 0v38.22l16-9.16a8 8 0 0 1 7.94 0l16 9.16Zm16-48a36 36 0 1 0-36 36a36 36 0 0 0 36-36"/></svg>`,
  },
  {
    key: "signal",
    name: "Signal",
    href: "https://files.stevedylan.dev/signal-qr.png",
    external: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 0 0-91.82 152.88l-11.35 34.05a16 16 0 0 0 20.24 20.24l34.05-11.35A104 104 0 1 0 128 24m0 192a87.87 87.87 0 0 1-44.06-11.81a8 8 0 0 0-6.54-.67L40 216l12.47-37.4a8 8 0 0 0-.66-6.54A88 88 0 1 1 128 216"/></svg>`,
  },
  {
    key: "atproto",
    name: "ATProto",
    href: `https://pdsls.dev/at://${OWNER_DID}`,
    external: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 0 0 0 208c21.51 0 44.1-6.48 60.43-17.33a8 8 0 0 0-8.86-13.33C166 210.38 146.21 216 128 216a88 88 0 1 1 88-88c0 26.45-10.88 32-20 32s-20-5.55-20-32V88a8 8 0 0 0-16 0v4.26a48 48 0 1 0 5.93 65.1c6 12 16.35 18.64 30.07 18.64c22.54 0 36-17.94 36-48A104.11 104.11 0 0 0 128 24m0 136a32 32 0 1 1 32-32a32 32 0 0 1-32 32"/></svg>`,
  },
  {
    key: "github",
    name: "GitHub",
    href: "https://github.com/stevedylandev",
    external: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 256 256"><path fill="currentColor" d="M208.31 75.68A59.78 59.78 0 0 0 202.93 28a8 8 0 0 0-6.93-4a59.75 59.75 0 0 0-48 24h-24a59.75 59.75 0 0 0-48-24a8 8 0 0 0-6.93 4a59.78 59.78 0 0 0-5.38 47.68A58.14 58.14 0 0 0 56 104v8a56.06 56.06 0 0 0 48.44 55.47A39.8 39.8 0 0 0 96 192v8H72a24 24 0 0 1-24-24a40 40 0 0 0-40-40a8 8 0 0 0 0 16a24 24 0 0 1 24 24a40 40 0 0 0 40 40h24v16a8 8 0 0 0 16 0v-40a24 24 0 0 1 48 0v40a8 8 0 0 0 16 0v-40a39.8 39.8 0 0 0-8.44-24.53A56.06 56.06 0 0 0 216 112v-8a58.14 58.14 0 0 0-7.69-28.32M200 112a40 40 0 0 1-40 40h-48a40 40 0 0 1-40-40v-8a41.74 41.74 0 0 1 6.9-22.48a8 8 0 0 0 1.1-7.69a43.8 43.8 0 0 1 .79-33.58a43.88 43.88 0 0 1 32.32 20.06a8 8 0 0 0 6.71 3.69h32.35a8 8 0 0 0 6.74-3.69a43.87 43.87 0 0 1 32.32-20.06a43.8 43.8 0 0 1 .77 33.58a8.09 8.09 0 0 0 1 7.65a41.7 41.7 0 0 1 7 22.52Z"/></svg>`,
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/steve-simkins/",
    external: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 256 256"><path fill="currentColor" d="M216 24H40a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V40a16 16 0 0 0-16-16m0 192H40V40h176zM96 112v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0m88 28v36a8 8 0 0 1-16 0v-36a20 20 0 0 0-40 0v36a8 8 0 0 1-16 0v-64a8 8 0 0 1 15.79-1.78A36 36 0 0 1 184 140m-84-56a12 12 0 1 1-12-12a12 12 0 0 1 12 12"/></svg>`,
  },
  // {
  //   key: "ethereum",
  //   name: "ENS",
  //   href: "https://app.ens.domains/stevedylandev.eth",
  //   external: true,
  //   icon: `<svg class="h-6 w-6" stroke-width="1.5" stroke="currentColor" viewBox="0 0 202 231" xmlns="http://www.w3.org/2000/svg"><path d="M98.3592 2.80337L34.8353 107.327C34.3371 108.147 33.1797 108.238 32.5617 107.505C26.9693 100.864 6.13478 72.615 31.9154 46.8673C55.4403 23.3726 85.4045 6.62129 96.5096 0.831705C97.7695 0.174847 99.0966 1.59007 98.3592 2.80337Z" fill="#fff" /><path d="M94.8459 230.385C96.1137 231.273 97.6758 229.759 96.8261 228.467C82.6374 206.886 35.4713 135.081 28.9559 124.302C22.5295 113.67 9.88976 96.001 8.83534 80.8842C8.7301 79.3751 6.64332 79.0687 6.11838 80.4879C5.27178 82.7767 4.37045 85.5085 3.53042 88.6292C-7.07427 128.023 8.32698 169.826 41.7753 193.238L94.8459 230.386V230.385Z" fill="#fff" /><path d="M103.571 228.526L167.095 124.003C167.593 123.183 168.751 123.092 169.369 123.825C174.961 130.465 195.796 158.715 170.015 184.463C146.49 207.957 116.526 224.709 105.421 230.498C104.161 231.155 102.834 229.74 103.571 228.526Z" fill="#fff" /><path d="M107.154 0.930762C105.886 0.0433954 104.324 1.5567 105.174 2.84902C119.363 24.4301 166.529 96.2354 173.044 107.014C179.471 117.646 192.11 135.315 193.165 150.432C193.27 151.941 195.357 152.247 195.882 150.828C196.728 148.539 197.63 145.808 198.47 142.687C209.074 103.293 193.673 61.4905 160.225 38.078L107.154 0.930762Z" fill="#fff" /></svg>`,
  // },
  {
    key: "pgp",
    name: "PGP",
    href: "https://stevedylan.dev/public_key.asc",
    external: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 256 256"><path fill="currentColor" d="M216.57 39.43a80 80 0 0 0-132.66 81.35L28.69 176A15.86 15.86 0 0 0 24 187.31V216a16 16 0 0 0 16 16h32a8 8 0 0 0 8-8v-16h16a8 8 0 0 0 8-8v-16h16a8 8 0 0 0 5.66-2.34l9.56-9.57A79.7 79.7 0 0 0 160 176h.1a80 80 0 0 0 56.47-136.57M224 98.1c-1.09 34.09-29.75 61.86-63.89 61.9H160a63.7 63.7 0 0 1-23.65-4.51a8 8 0 0 0-8.84 1.68L116.69 168H96a8 8 0 0 0-8 8v16H72a8 8 0 0 0-8 8v16H40v-28.69l58.83-58.82a8 8 0 0 0 1.68-8.84A63.7 63.7 0 0 1 96 95.92c0-34.14 27.81-62.8 61.9-63.89A64 64 0 0 1 224 98.1M192 76a12 12 0 1 1-12-12a12 12 0 0 1 12 12"/></svg>`,
  },
  {
    key: "photos",
    name: "Photos",
    href: "https://steve.photo",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 256 256"><path fill="currentColor" d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 16v102.75l-26.07-26.06a16 16 0 0 0-22.63 0l-20 20l-44-44a16 16 0 0 0-22.62 0L40 149.37V56ZM40 172l52-52l80 80H40Zm176 28h-21.37l-36-36l20-20L216 181.38zm-72-100a12 12 0 1 1 12 12a12 12 0 0 1-12-12"/></svg>`,
  },
];

export const getSocial = (key: string): SocialItem | undefined =>
  SOCIAL_ITEMS.find((item) => item.key === key);
