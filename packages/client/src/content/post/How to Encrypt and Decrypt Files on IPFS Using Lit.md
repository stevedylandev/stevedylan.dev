---
title: "How to Encrypt and Decrypt Files on IPFS Using Lit Protocol"
publishDate: "04 Nov 2023"
description: "Experience the power of decentralized storage, encryption, and token gating with this tutorial"
tags: ["ipfs", "web3", "tutorials"]
ogImage: "/blog-images/other/6545bfa112815d6340466066_20231103_How-to-Encrypt-and-Decrypt-Files-on-IPFS-Using-Lit-Protocol-and-Pinata.jpeg"
atUri: "at://did:plc:ia2zdnhjaokf5lazhxrmj6eu/site.standard.document/3mdzvus3hnn2v"
---

The most popular method used for sharing files off-chain in Web3 is IPFS, and there are some [good reasons for that](https://www.pinata.cloud/blog/why-ipfs-is-the-storage-solution-for-web3-developers). However it does not come without its own share of problems, and one of those is the ability to share private files. IPFS is a public network so anyone with a CID can access and download that content, and this hinders projects that may want to token gate content or create subscriptions to content. With that said, encryption has proven to be one solution to this problem. Remarkably, the solution of [asymmetric encryption](https://www.okta.com/identity-101/asymmetric-encryption) is used in blockchain all the time and can be reused for the purpose of token gating. [Lit Protocol](https://litprotocol.com/) is a decentralized middleware client that enables access controls to help extend asymmetric encryption to token gating based on crypto ownership, such as owning an NFT, ERC-20 token balance, or simply designating a recipient address. In this post, we’ll show you how you can combine the best of both worlds and create an app that will encrypt content, upload it to IPFS, and then given an encrypted CID, decrypt it.

## Why IPFS?

IPFS is public and openly available, but it’s also not permanent by default. This means that unlike blockchain storage protocols that make every piece of content permanent as soon as it’s uploaded, you can potentially remove content from IPFS. You’ll see why this is important as we explore encryption more deeply.

The biggest problem with encryption is that its always evolving. One encryption method we use today will be outdated one day in the future. An example is [MD5 which was cracked almost perhaps 10 years ago](https://www.okta.com/identity-101/md5/#:~:text=The%20MD5%20hash%20function's%20security,be%20used%20for%20malicious%20purposes.) but people still use it without knowing the risk. When we consider putting files on a decentralized network that are specifically designed to not be taken down, things get messy. Arweave is a common consideration for encryption and decentralized storage, however, their model puts content on the network permanently. There is the possibility those encrypted files could be cracked in another 10 years.

IPFS is different in that content is not “permanent,” but rather it is “persistent.” It's a subtle difference but has massive ramifications. With IPFS, the content will only stay on the network if at least one IPFS node keeps the content “[pinned](https://www.pinata.cloud/blog/what-is-pinning),” which tells other nodes that might have a cached copy of the content to keep it available. As soon as there are no nodes pinning a particular CID, then the nodes holding that cache will dump it when they use garbage collection. It's a unique mechanism that helps prevent digital waste and ensures only the content we value will persist. The concepts of permanence and persistence are truly philosophical differences of approaching the same problem.

When you combine IPFS with encryption, you get a unique situation where content that is no longer used can be unpinned. Granted it does not guarantee the content will be completely wiped from the network, but it does give users a level of control over their content they would normally not have with other decentralized storage networks. It is also unlikely that bad actors would go through the trouble and costs to keep encrypted content pinned for the purpose of decrypting it years down the road. The [cost of storage](https://www.pinata.cloud/blog/is-ipfs-free) helps balance situations like these. With that said let's actually build this thing!

<aside>
ℹ️ <b>Disclosure:</b> There will always be limitations to encryption and eventually current methods may be cracked. Please be aware of the risk involved and be sure to read <a href="https://developer.litprotocol.com/v3/sdk/authentication/security">Lit Protocol’s best practices for security.</a>
</aside>

## Building the App

What’s great about this project is that we already have most of what we need to build it! Pinata created a [Next.js template](https://www.pinata.cloud/blog/announcing-pinata-ipfs-developer-starter-templates) a while back which we can use again and just add in our Lit Protocol SDK.

To follow this tutorial you will want to make sure you have the following:

- Node.js 18 or higher
- [A Free Pinata Account](https://app.pinata.cloud/register)
- A text editor like VSCode

Before going any further make sure you get a [free Pinata account](https://app.pinata.cloud/register) so you can make an [API key](https://docs.pinata.cloud/docs/api-keys) and get a [free Dedicated Gateway](https://docs.pinata.cloud/docs/dedicated-ipfs-gateways) for this project! Once you make an API key, save the `JWT` that we’ll use in a little bit, as well as the gateway domain for your Dedicated Gateways.

Thats it! To kick it off, simply run the command to use the Pinata Next.js Template

```bash
npx create-pinata-app
```

You will be prompted to choose your flavors of the app, such as Typescript vs Javascript, or Tailwindcss vs Vanilla CSS. For this template, I chose Typescript and Tailwindcss but feel free to choose your own. After giving it a name and making your selections go ahead and open the project in VSCode.

Back in the terminal the next thing we’re going to do is install the [Lit Protocol SDK](https://developer.litprotocol.com/v3/sdk/installation). We’ll be using the V3 of the SDK which is in beta, and you can install based on their docs [here](https://developer.litprotocol.com/v3/sdk/installation) or use this command:

```bash
npm install @lit-protocol/lit-node-client@cayenne
```

The last thing you need to do to set up the project is open the `.env.sample` file which should look like this:

```
PINATA_JWT=
NEXT_PUBLIC_GATEWAY_URL=
NEXT_PUBLIC_GATEWAY_TOKEN=
```

Paste in the `PINATA_JWT` that you made earlier when you set up your Pinata account and also paste in the `NEXT_PUBLIC_GATEWAY_URL` with the format `[https://mygateway.mypinata.cloud](https://mygateway.mypinata.cloud)` with of course your own domain URL. Then change the name of the file from `.env.sample` to `.env.local`, a very important step for our app to work!

Now lets go ahead and spin up the dev server with `npm run dev` and start building. All of our work will be done in just one file, `pages/index.tsx`; easy! We’ll start by importing the Lit Protocol SDK at the top of the file.

```jsx
import { useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import Files from "@/components/Files";
// import lit protocol sdk
import * as LitJsSdk from "@lit-protocol/lit-node-client";
```

Inside the `Home` component, we’ll add another state variable that we’ll come back to later.

```jsx
const [file, setFile] = useState("");
const [cid, setCid] = useState("");
const [uploading, setUploading] = useState(false);
// add a new state for the cid to decrypt
const [decryptionCid, setDecryptionCid] = useState("");
```

The great thing about this template is that it's already got uploads to IPFS with Pinata baked in with an `/api/files` route on the backend, so all we have to do is encrypt the file before we upload it. We’ll do this in the `uploadFile` function inside of `Home`, and it should look like this to start.

```jsx
const uploadFile = async (fileToUpload) => {
  try {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload, fileToUpload.name);
    const res = await fetch("/api/files", {
      method: "POST",
      body: formData,
    });
    const ipfsHash = await res.text();
    setCid(ipfsHash);
    setUploading(false);
  } catch (e) {
    console.log(e);
    setUploading(false);
    alert("Trouble uploading file");
  }
};
```

At the top of our `try` statement but underneath our `setUploading` state, we’ll initialize the `LitNodeClient` using the `ceyenne` network, connect our app to that network, then get the `authSig`. Lit Protocol is a decentralized network middleware that helps us do some cool token gating and lets us do encryption. In these few statements, we create a client that connects to that middleware network and then gets a signature from the user. This signature will be used for signing the encrypted files.

```jsx
const uploadFile = async (fileToUpload) => {
    try {
      setUploading(true);
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });
      // then get the authSig
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
// rest of the code
```

Next up we’ll set up our access controls for this encrypted content. We’ll dive deeper into this later in the tutorial, but essentially this is the most important part of our app as it determines who can decrypt the content we encrypt. It could be something like token gating by NFT collection or a direct address. For now, we’ll keep it simple and allow anyone with a balance of 0 ETH or higher to decrypt it (that should be everyone with a wallet).

```jsx
const uploadFile = async (fileToUpload) => {
    try {
      setUploading(true);
			// Create our litNodeClient
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });
      // Then get the authSig
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
			// Define our access controls, this is set to be anyone
			const accs = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '0',
          },
        },
      ];
// rest of the code
```

The fun part; encrypting! There are several methods of encryption that Lit Protocol offers through their SDK, such as just a string, or a file, and in our case, we’ll use the `encryptFileAndZipWithMetadata` method. This is handy because in order to decrypt a file, our recipient will need the `accs` parameters we set and a secure hash. We want a simple way for all of this to be packaged and included in our IPFS CID, and that's exactly what this method will do. All we have to do is pass in our access control conditions array, our `authSig`, the chain, our `fileToUpload` that we passed into the function argument, the `litNodeClient`, and finally a simple `readme` that will explain to whoever happens to download it from IPFS what they need to do with it.

```jsx
const uploadFile = async (fileToUpload) => {
    try {
      setUploading(true);
      // Create our litNodeClient
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });
      // Then get the authSig
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
      // Define our access controls, this is set to be anyone
      const accs = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '0',
          },
        },
      ];
      // Then we use our access controls and authSig to encrypt the file and zip it up with the metadata
      const encryptedZip = await LitJsSdk.encryptFileAndZipWithMetadata({
        accessControlConditions: accs,
        authSig,
        chain: 'ethereum',
        file: fileToUpload,
        litNodeClient: litNodeClient,
        readme: "Use IPFS CID of this file to decrypt it"
      });
// rest of the code
```

One last little touch we need to do is adapt this encrypted zip file so it will be accepted by our `/api/files` endpoint, and we’ll do so with just two lines of code.

```jsx
// Then we turn it into a file that will be accepted by the API endpoint
const encryptedBlob = new Blob([encryptedZip], { type: "text/plain" });
const encryptedFile = new File([encryptedBlob], fileToUpload.name);
```

All together we should have an upload function that looks like this:

```jsx
const uploadFile = async (fileToUpload) => {
  try {
    setUploading(true);
    // Create our litNodeClient
    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: "cayenne",
    });
    // Then get the authSig
    await litNodeClient.connect();
    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: "ethereum",
    });
    // Define our access controls, this is set to be anyone
    const accs = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "eth_getBalance",
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: ">=",
          value: "0",
        },
      },
    ];
    // Then we use our access controls and authSig to encrypt the file and zip it up with the metadata
    const encryptedZip = await LitJsSdk.encryptFileAndZipWithMetadata({
      accessControlConditions: accs,
      authSig,
      chain: "ethereum",
      file: fileToUpload,
      litNodeClient: litNodeClient,
      readme: "Use IPFS CID of this file to decrypt it",
    });

    // Then we turn it into a file that will be accepted by the Pinata API
    const encryptedBlob = new Blob([encryptedZip], { type: "text/plain" });
    const encryptedFile = new File([encryptedBlob], fileToUpload.name);

    // Finally we upload the file by passing it to our /api/files endpoint
    // Keep in mind this works for smaller files and you may need to do a presigned JWT and upload from the client if you're dealing with larger files
    // Read more about that here: https://www.pinata.cloud/blog/how-to-upload-to-ipfs-from-the-frontend-with-signed-jwts
    const formData = new FormData();
    formData.append("file", encryptedFile, encryptedFile.name);
    const res = await fetch("/api/files", {
      method: "POST",
      body: formData,
    });
    const ipfsHash = await res.text();
    setCid(ipfsHash);
    setUploading(false);
  } catch (e) {
    console.log(e);
    setUploading(false);
    alert("Trouble uploading file");
  }
};
```

One thing to note is that there is a file size restriction when using the Next API routes, so if you have larger files you may want to move uploading to the client side and utilize pre-signed JWTs which we talk about in [this post.](https://www.pinata.cloud/blog/how-to-upload-to-ipfs-from-the-frontend-with-signed-jwts)

We now have encrypted uploads! If you upload a file through the app you should get a CID, and if you download the file it will result in a zip folder with all the stuff we just made. This is cool, but how do we decrypt it? How do we let other people decrypt it? Its actually pretty easy! We’re gonna make a new function right below our upload function called `decryptFile()`, which will take a `fileToDecrypt` CID. First thing we’ll do is fetch that file using our Dedicated Gateway and turn it into a blob.

```jsx
const decryptFile = async (fileToDecrypt) => {
    try {
      // First we fetch the file from IPFS using the CID and our Gateway URL, then turn it into a blob
      const fileRes = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${fileToDecrypt}?filename=encrypted.zip`)
      const file = await fileRes.blob()
    } catch (error) {
      alert("Trouble decrypting file")
      console.log(error)
    }
```

Now we can re-create the `litNodeClient` and get the auth signature. The beauty of this SDK is that once some signs they will not need to sign again unless they disconnect from the app, making the interactions fairly smooth.

```jsx
const decryptFile = async (fileToDecrypt) => {
    try {
      // First we fetch the file from IPFS using the CID and our Gateway URL, then turn it into a blob
      const fileRes = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${fileToDecrypt}?filename=encrypted.zip`)
      const file = await fileRes.blob()
      // We recreated the litNodeClient and the authSig
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
    } catch (error) {
      alert("Trouble decrypting file")
      console.log(error)
    }
```

Just like we used `encryptFileAndZipWithMetadata` method, we have a matching method for decryption called `decryptZipFileWithMetadata` which we’ll use very similarly to the encryption. The zip folder has everything we need so all we have to pass in is the `file` blob, our `litNodeClient`, and the recipient `authSig`. Piece of cake! From this, we’ll extract the `decryptedFile` and `metadata` from our request.

```jsx
const decryptFile = async (fileToDecrypt) => {
    try {
      // First we fetch the file from IPFS using the CID and our Gateway URL, then turn it into a blob
      const fileRes = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${fileToDecrypt}?filename=encrypted.zip`)
      const file = await fileRes.blob()
      // We recreated the litNodeClient and the authSig
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
      // Then we simpyl extract the file and metadata from the zip
      // We could do more with this, like try to display it in the app UI if we wanted to
      const { decryptedFile, metadata } = await LitJsSdk.decryptZipFileWithMetadata({
        file: file,
        litNodeClient: litNodeClient,
        authSig: authSig,
      })
    } catch (error) {
      alert("Trouble decrypting file")
      console.log(error)
    }
```

All that’s left to do is deliver the file to the user! There are several ways you could go about it, for example, if you want to display the content to the user such as an image or video you could do so with a bit of formatting. In this example, we’ll just trigger a download to the recipient’s computer. All together we should have the following.

```jsx
const decryptFile = async (fileToDecrypt) => {
    try {
      // First we fetch the file from IPFS using the CID and our Gateway URL, then turn it into a blob
      const fileRes = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${fileToDecrypt}?filename=encrypted.zip`)
      const file = await fileRes.blob()
      // We recreated the litNodeClient and the authSig
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
      // Then we simpyl extract the file and metadata from the zip
      // We could do more with this, like try to display it in the app UI if we wanted to
      const { decryptedFile, metadata } = await LitJsSdk.decryptZipFileWithMetadata({
        file: file,
        litNodeClient: litNodeClient,
        authSig: authSig,
      })
      // After we have our dcypted file we can download it
      const blob = new Blob([decryptedFile], { type: 'application/octet-stream' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = metadata.name;  // Use the metadata to get the file name and type

    } catch (error) {
      alert("Trouble decrypting file")
      console.log(error)
    }
```

One small little change we’ll make to the JSX is a text input where someone can paste in a CID and a “Decrypt” button someone can press after pasting in their CID.

```jsx
<input
  type="text"
  onChange={(e) => setDecryptionCid(e.target.value)}
  className="px-4 py-2 border-2 border-secondary rounded-3xl text-lg"
  placeholder="Enter CID to decrypt"
/>
<button
  onClick={() => decryptFile(decryptionCid)}
  className="mr-10 w-[150px] bg-light text-secondary border-2 border-secondary rounded-3xl py-2 px-4 hover:bg-secondary hover:text-light transition-all duration-300 ease-in-out"
>Decrypt</button>
```

With all of this together, you should have an app with the following flow!

<video muted autoplay style="width: 100%; height: auto; position: relative;">
    <source src="https://mktg.mypinata.cloud/ipfs/QmcoP5gj1gJyZNCDUHE2e1g1cbwvEHo6E56xMhPV8KaHaf/file-encryption.mp4" type="video/mp4">
</video>

You can also download and use this exact template [here](https://github.com/PinataCloud/pinata-lit-protocol-template)!

## Going Further

This little template is really designed just to get you started and help you understand how Pinata and Lit Protocol work, and there is so much you can do with it. I would highly recommend checking out Lit Protocol’s documentation, in particular their section on all the [different access controls](https://developer.litprotocol.com/v3/sdk/access-control/evm/basic-examples) you can do. For example, if you only wanted holders of a particular ERC721 NFT you could use the following.

```jsx
const accessControlConditions = [
  {
    contractAddress: "0xA80617371A5f511Bf4c1dDf822E6040acaa63e71",
    standardContractType: "ERC721",
    chain,
    method: "balanceOf",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: ">",
      value: "0",
    },
  },
];
```

Or you could do DAO membership (MolochDAOv2.1, also supports DAOHaus)\***\*[](https://developer.litprotocol.com/v3/sdk/access-control/evm/basic-examples#must-be-a-member-of-a-dao-molochdaov21-also-supports-daohaus)\*\***

```jsx
const accessControlConditions = [
  {
    contractAddress: "0x50D8EB685a9F262B13F28958aBc9670F06F819d9",
    standardContractType: "MolochDAOv2.1",
    chain,
    method: "members",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: "=",
      value: "true",
    },
  },
];
```

You can even do a simple check if the recipient is a particular wallet address.

```jsx
const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain,
    method: "",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: "=",
      value: "0x50e2dac5e78B5905CB09495547452cEE64426db2",
    },
  },
];
```

With these building blocks, you could easily build a standalone token gating app, or build a custom solution for your holders. The possibilities are endless!

Happy Pinning!
