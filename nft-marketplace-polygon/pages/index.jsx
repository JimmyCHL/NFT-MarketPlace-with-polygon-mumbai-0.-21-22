import Head from "next/head";
import { ethers } from "ethers";
import axios from "axios";
import web3Modal from "web3modal";
import { useState, useEffect } from "react";
import { nftAddress, nftMarketAddress } from "../abi/config";
import NFTAbi from "../abi/NFT.json";
import NFTMarketAbi from "../abi/NFTMarket.json";

//matic is not equal to eth, but

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider( // or https://rpc-mumbai.matic.today
      "https://polygon-mumbai.infura.io/v3/6bec6247b9fd46e59eb89edf63a9c203" //default is connect to localhost blockchain
    ); //connect to Ethereum node such as Parity and Geth.(main net, testnet or any other net)
    // console.log(provider);
    const tokenContract = new ethers.Contract(nftAddress, NFTAbi.abi, provider);
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarketAbi.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();

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

  const buyNft = async (nft) => {
    const web3modal = new web3Modal();
    const instance = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      nftMarketAddress,
      NFTMarketAbi.abi,
      signer
    );

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const transaction = await contract.createMarketSale(
      nftAddress,
      nft.itemId,
      { value: price }
    );

    transaction.wait();

    loadNFTs();
  };

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;

  return (
    <div className="flex justify-center">
      <Head>
        <title>NFT Market Place</title>
        <meta name="NFT" content="Generate NFT Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="px-4 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, index) => {
            return (
              <div
                key={index}
                className="border shadow rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.01] transition-all ease 0.2s"
              >
                <img
                  src={nft.image}
                  alt=""
                  className="w-full h-[200px] object-cover"
                />
                <div className="p-4">
                  <p className="text-2xl font-semibold h-[32px]">{nft.name}</p>
                  <div className="h-[70px] overflow-hidden">
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">
                    {nft.price} ETH
                  </p>
                  <button
                    className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded hover:bg-pink-300"
                    onClick={() => buyNft(nft)}
                  >
                    Buy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
