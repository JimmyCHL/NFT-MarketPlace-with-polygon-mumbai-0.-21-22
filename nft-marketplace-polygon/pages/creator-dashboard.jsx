import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftAddress, nftMarketAddress } from "../abi/config";
import NFTABI from "../abi/NFT.json";
import MARKETABI from "../abi/NFTMarket.json";

const CreatorDashboard = () => {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);

  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect(); //default it would connect to window.ethereum metamask api( this is what i think)
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const tokenContract = new ethers.Contract(nftAddress, NFTABI.abi, signer);
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      MARKETABI.abi,
      signer
    );
    const data = await marketContract.fetchItemsCreated();

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
          sold: item.sold,
          name: meta.data.name,
          description: meta.data.description,
        };
        return itemObject;
      })
    );

    const soldItems = items.filter((item) => item.sold);
    setSold(soldItems);
    setNfts(items);
    setLoadingState("loaded");
  };

  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, index) => (
            <div
              key={index}
              className="border shadow rounded-xl overflow-hidden"
            >
              <img
                src={nft.image}
                alt="created nft"
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
      <div className="px-4">
        {Boolean(sold.length) && (
          <div>
            <h2 className="text-2xl py-2">Items sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft, index) => (
                <div
                  key={index}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} alt="created nft" />
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">
                      Price - {nft.price} ETH
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
