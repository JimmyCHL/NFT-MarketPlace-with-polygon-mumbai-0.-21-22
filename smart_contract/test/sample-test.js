const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function() {
    it("Should create and execute market sales", async function() {
        const Market = await ethers.getContractFactory("NFTMarket");
        const market = await Market.deploy();
        await market.deployed();

        const marketAddress = market.address;
        console.log(marketAddress);

        const NFT = await ethers.getContractFactory("NFT");
        const nft = await NFT.deploy(marketAddress);
        await nft.deployed();

        const nftContractAddress = nft.address;
        console.log(nftContractAddress);

        let listingPrice = await market.getListingPrice();
        console.log(listingPrice);
        listingPrice = listingPrice.toString();

        const auctionPrice = ethers.utils.parseUnits("100", "ether");

        const firstItemTokenId = await nft.createToken(
            "https://www.mytokenlocation.com"
        );
        const secondItemTokenId = await nft.createToken(
            "https://www/mytokenlocation2.com"
        );

        await market.createMarketItem(nftContractAddress, 1, auctionPrice, {
            value: listingPrice,
        });
        await market.createMarketItem(nftContractAddress, 2, auctionPrice, {
            value: listingPrice,
        });

        //get first and second account/wallet address.
        const [_, buyerAddress] = await ethers.getSigners();

        await market
            .connect(buyerAddress)
            .createMarketSale(nftContractAddress, 1, { value: auctionPrice });
        console.log(value);

        let items = await market.fetchMarketItems();

        items = await Promise.all(
            items.map(async(i) => {
                const tokenUri = await nft.tokenURI(i.tokenId);
                let item = {
                    price: i.price.toString(),
                    tokenId: i.tokenId.toString(),
                    seller: i.seller,
                    owner: i.owner,
                    tokenUri,
                };
                return item;
            })
        );

        console.log("items: ", items);

        const myNft = await market.connect(buyerAddress).fetchMyNFTs();

        console.log(myNft);
    });
});