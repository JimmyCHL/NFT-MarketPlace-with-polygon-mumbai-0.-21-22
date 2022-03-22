import React, { useState } from "react";
import { ethers } from "ethers";
import { client } from "../utils/ipfsClient";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import { nftAddress, nftMarketAddress } from "../abi/config";
import NFTABI from "../abi/NFT.json";
import MARKETABI from "../abi/NFTMarket.json";

const projectId = process.env.NEXT_PUBLIC_PROJECTID;
const projectSecret = process.env.NEXT_PUBLIC_PROJECTSECRET;

const CreateItem = () => {
  const [fileUrl, setFileUrl] = useState("");
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  //store the file(pics) to the ipfs and get the gateway url
  const handleFileChange = async (e) => {
    if (e.target.files.length === 0) return setFileUrl("");
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      //in here added.cid.toString() === added.path
      //   console.log(added.cid.toString());
      const url = `https://ipfs.infura-ipfs.io/ipfs/${added.cid.toString()}`;
      setFileUrl(url);
    } catch (error) {
      console.log(error);
    }
  };

  // create jsonfile and send jsonfile to ipfs and get the url getway
  const createItem = async () => {
    const { name, description, price } = formInput;
    if (!name || !description || !fileUrl || !price) return;

    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  async function createSale(url) {
    const webModal = new Web3Modal();
    const connection = await webModal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    //there is only up to one account that metamask
    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftAddress, NFTABI.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();
    // console.log(tx);

    //look for tokenId after createToken!!
    let event = tx.events[0]; //this transaction info was stored in events
    let value = event.args[2]; //In the index 2 is bigNumber, the tokenId
    let tokenId = value.toNumber(); //This is the return value from the createToken function in nft contract

    const price = ethers.utils.parseUnits(formInput.price, "ether"); //this would give you a BigNumber instance of the amount of wei.

    contract = new ethers.Contract(nftMarketAddress, MARKETABI.abi, signer);
    let listingPrice = await contract.getListingPrice(); //the number you get from contract would always be BigNumber type
    listingPrice = listingPrice.toString(); //change BigNumber type to become human readable string -> wei value.

    transaction = await contract.createMarketItem(nftAddress, tokenId, price, {
      value: listingPrice,
    });

    await transaction.wait();
    // console.log(transaction);

    router.push("/");
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          type="text"
          placeholder="Asset Name"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
          className="mt-8 border rounded p-4"
        />
        <textarea
          type="text"
          placeholder="Asset Description"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
          className="mt-2 border rounded p-4"
        />
        <input
          type="text"
          placeholder="Asset Price in Matic"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
          className="mt-2 border rounded p-4"
        />

        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={handleFileChange}
        />

        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}

        <button
          onClick={createItem}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  );
};

export default CreateItem;
