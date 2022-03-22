import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftAddress, nftMarketAddress } from "../abi/config";
import NFTABI from "../abi/NFT.json";
import MARKETABI from "../abi/NFTMarket.json";

const MyAssets = () => {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
    return;
  }, []);

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const tokenContract = new ethers.Contract(nftAddress, NFTABI.abi, signer);
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      MARKETABI.abi,
      signer
    );
    const data = await marketContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (item) => {
        const tokenUri = await tokenContract.tokenURI(item.tokenId);
        const meta = await axios.get(tokenUri);

        let price = ethers.utils.formatUnits(item.price.toString(), "ether");
        let itemObject = {
          price,
          itemId: item.itemId.toNumber(),
          tokenId: item.tokenId.toNumber(),
          seller: item.seller,
          owner: item.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return itemObject;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  };

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No assets owned</h1>;

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, index) => (
            <div
              src={index}
              className="border shadow rounded-xl overflow-hidden"
            >
              <img
                src={nft.image}
                alt="nft photo"
                className="w-full h-[200px] object-cover"
              />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} ETH
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyAssets;
