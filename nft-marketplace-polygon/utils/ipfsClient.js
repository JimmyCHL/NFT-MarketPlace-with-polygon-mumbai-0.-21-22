import { create as ipfsHttpClient } from "ipfs-http-client";

const projectId = process.env.NEXT_PUBLIC_PROJECTID;
const projectSecret = process.env.NEXT_PUBLIC_PROJECTSECRET;
const auth =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

export const client = ipfsHttpClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    path: "/api/vo",
    headers: {
        authorization: auth,
    },
});