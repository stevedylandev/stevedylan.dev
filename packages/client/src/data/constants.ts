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
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M3.6 9h16.8"></path><path d="M3.6 15h16.8"></path><path d="M11.5 3a17 17 0 0 0 0 18"></path><path d="M12.5 3a17 17 0 0 1 0 18"></path></svg>`,
  },
  {
    key: "email",
    name: "Email",
    href: "mailto:contact@stevedylan.dev",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m2.357 7.714l6.98 4.654c.963.641 1.444.962 1.964 1.087c.46.11.939.11 1.398 0c.52-.125 1.001-.446 1.964-1.087l6.98-4.654M7.157 19.5h9.686c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.31-1.311c.328-.642.328-1.482.328-3.162V9.3c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311c-.642-.327-1.482-.327-3.162-.327H7.157c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.31 1.311c-.328.642-.328 1.482-.328 3.162v5.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311c.642.327 1.482.327 3.162.327"/></svg>`,
  },
  {
    key: "rss",
    name: "RSS",
    href: "https://stevedylan.dev/rss.xml",
    external: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></g></svg>`,
  },
  {
    key: "cv",
    name: "CV",
    href: "/cv",
    external: false,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6" stroke-width="0.5" stroke="currentColor"><path fill="currentColor" d="M2 5.75A2.75 2.75 0 0 1 4.75 3h14.5A2.75 2.75 0 0 1 22 5.75v9.5A2.75 2.75 0 0 1 19.25 18H10v-1q.18-.24.331-.5h8.919c.69 0 1.25-.56 1.25-1.25v-9.5c0-.69-.56-1.25-1.25-1.25H4.75c-.69 0-1.25.56-1.25 1.25v3.919a5 5 0 0 0-1.5 1.33zM6.75 7a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5zm6 5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5zM6 10a4 4 0 1 0 0 8.001A4 4 0 0 0 6 10m3 8.001c-.835.628-1.874 1-3 1a4.98 4.98 0 0 1-3-.998v3.246c0 .57.605.92 1.09.669l.09-.055L6 20.592l1.82 1.272a.75.75 0 0 0 1.172-.51L9 21.249z"/></svg>`,
  },
  {
    key: "signal",
    name: "Signal",
    href: "https://files.stevedylan.dev/signal-qr.png",
    external: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6" stroke-width="0.5" stroke="currentColor"><path fill="currentColor" d="m9.637 2.292l.221.91A8.8 8.8 0 0 0 7.385 4.24l-.474-.803a9.7 9.7 0 0 1 2.726-1.145m4.726 0l-.222.91a8.8 8.8 0 0 1 2.474 1.038l.477-.803a9.7 9.7 0 0 0-2.73-1.145M3.57 6.831c-.512.86-.892 1.793-1.128 2.768l.895.225A9.1 9.1 0 0 1 4.36 7.312zm-.493 5.168q0-.682.1-1.357l-.912-.141a10.2 10.2 0 0 0 0 2.997l.912-.141q-.1-.675-.1-1.358m14.011 8.562l-.473-.803c-.768.47-1.6.821-2.47 1.039l.22.91a9.7 9.7 0 0 0 2.723-1.146m3.834-8.562q0 .684-.1 1.358l.912.14c.148-.993.148-2.003 0-2.996l-.912.14q.1.676.1 1.358m.635 2.4l-.895-.225a9.1 9.1 0 0 1-1.023 2.512l.79.485a10 10 0 0 0 1.128-2.772m-8.22 6.562a8.9 8.9 0 0 1-2.674 0l-.139.927a9.7 9.7 0 0 0 2.951 0zm5.845-3.586a9 9 0 0 1-1.89 1.919l.547.755a10 10 0 0 0 2.086-2.113zm-1.89-12.67a9 9 0 0 1 1.89 1.92l.743-.563a10 10 0 0 0-2.08-2.112zM4.817 6.624a9 9 0 0 1 1.89-1.92l-.553-.755a10 10 0 0 0-2.08 2.112zm15.613.206l-.79.481a9.1 9.1 0 0 1 1.022 2.51l.895-.226A10 10 0 0 0 20.43 6.83m-9.767-3.792a8.9 8.9 0 0 1 2.673 0l.139-.927a9.7 9.7 0 0 0-2.95 0zM5.29 20.297l-1.906.451l.445-1.935l-.899-.214l-.444 1.936a.95.95 0 0 0 .246.876a.92.92 0 0 0 .863.25l1.904-.444zm-2.168-2.534l.899.212l.308-1.342a9.1 9.1 0 0 1-.993-2.459l-.895.225c.2.829.506 1.627.908 2.376zm4.308 2.03l-1.322.313l.21.913l.972-.23a9.7 9.7 0 0 0 2.34.922l.221-.91a8.8 8.8 0 0 1-2.415-1.013zM12 3.876c-1.43 0-2.833.39-4.063 1.128A8.07 8.07 0 0 0 5 8.071a8.23 8.23 0 0 0 .23 8.251l-.77 3.333l3.282-.781a7.89 7.89 0 0 0 7.111.717a8 8 0 0 0 3.04-2.092a8.16 8.16 0 0 0 1.799-3.25a8.25 8.25 0 0 0 .18-3.724a8.2 8.2 0 0 0-1.477-3.413a8 8 0 0 0-2.822-2.385A7.9 7.9 0 0 0 12 3.875"/></svg>`,
  },
  {
    key: "atproto",
    name: "ATProto",
    href: `https://pdsls.dev/at://${OWNER_DID}`,
    external: true,
    icon: `<svg class="h-6 w-6" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></g></svg>`,
  },
  {
    key: "github",
    name: "GitHub",
    href: "https://github.com/stevedylandev",
    external: true,
    icon: `<svg class="h-6 w-6" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path></svg>`,
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/steve-simkins/",
    external: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M8 11l0 5"></path><path d="M8 8l0 .01"></path><path d="M12 16l0 -5"></path><path d="M16 16v-3a2 2 0 0 0 -4 0"></path></svg>`,
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
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke-width="1.5" stroke="currentColor" class="h-6 w-6" width="32" height="32" viewBox="0 0 24 24"><g fill="none"><g stroke="currentColor" clip-path="url(#SVGXv8lpc2Y)"><path stroke-linecap="round" d="M14.257 5.976c-.85-1.7-2.832-2.638-4.802-2.147c-2.27.566-3.663 2.815-3.112 5.023c.157.633.458 1.194.86 1.659l-2.709 4.37a1.5 1.5 0 0 0-.18 1.153l.36 1.44a.25.25 0 0 0 .302.183l1.528-.381a1.5 1.5 0 0 0 .912-.666l2.884-4.655"/><ellipse cx="10.82" cy="7.266" rx="1.059" ry="1.03" transform="rotate(-14 10.82 7.266)"/><path d="M17.81 15.61c2.27-.566 3.664-2.815 3.113-5.023c-.55-2.209-2.837-3.54-5.106-2.974c-2.27.566-3.663 2.815-3.113 5.023c.158.633.458 1.194.86 1.659l-2.708 4.37a1.5 1.5 0 0 0-.18 1.153l.359 1.44a.25.25 0 0 0 .303.183l1.527-.381a1.5 1.5 0 0 0 .912-.666l2.885-4.655q.569.014 1.149-.129Z"/><ellipse cx="17.203" cy="10.984" rx="1.059" ry="1.03" transform="rotate(-14 17.203 10.984)"/></g><defs><clipPath id="SVGXv8lpc2Y"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs></g></svg>`,
  },
  {
    key: "photos",
    name: "Photos",
    href: "https://steve.photo",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 3m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"></path><path d="M4.012 7.26a2.005 2.005 0 0 0 -1.012 1.737v10c0 1.1 .9 2 2 2h10c.75 0 1.158 -.385 1.5 -1"></path><path d="M17 7h.01"></path><path d="M7 13l3.644 -3.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644"></path><path d="M15 12l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l2.644 2.644"></path></svg>`,
  },
];

export const getSocial = (key: string): SocialItem | undefined =>
  SOCIAL_ITEMS.find((item) => item.key === key);
