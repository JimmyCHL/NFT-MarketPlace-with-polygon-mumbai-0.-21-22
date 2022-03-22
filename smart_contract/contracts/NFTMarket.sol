//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";//require for all compliant
import "@openzeppelin/contracts/utils/Counters.sol"; // increment number
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";//Contract module that helps prevent reentrant calls to a function
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/*
Inheriting from ReentrancyGuard will make the nonReentrant modifier available, 
which can be applied to functions to make sure there are no nested (reentrant) calls to them.
 */

contract NFTMarket is ReentrancyGuard, IERC721Receiver {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.025 ether;

    constructor()  {
        owner = payable(msg.sender);
    }

    struct MarketItem{
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    //to be able to get marketitem by itemId
    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated (uint indexed itemId, address indexed nftContract, uint256 indexed tokenId, address seller, address owner, uint256 price, bool sold);

    //get listing price
    function getListingPrice() public view returns (uint256){
        return listingPrice;
    }

    function createMarketItem(address nftContract, uint256 tokenId, uint256 price) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Price must be equal to listing price!");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)),price, false);
        //address(0) means empty address -> '0x0'

        //nft_contract inherited from IERC721 (interface to show functionality that ERC721 has)
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId, bytes('success'));
        
        emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, address(0), price, false);
        
        

    }

    //When a function is called, the first 4 bytes of calldata specifies which function to call.
    // This 4 bytes is called a function selector.
    function onERC721Received(address, address, uint256, bytes memory data) public virtual pure override returns(bytes4) {
        require((keccak256(data) == keccak256(bytes('success'))) , 'it is not succeed');

        // return this.onERC721Received.selector; => this would work as well
        //This function takes in any amount of inputs and converts it to a unique 32 byte hash.
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }



    function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant{
        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        require(msg.sender != idToMarketItem[itemId].seller, "your are the seller and you can not buy it");

        idToMarketItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);
    }

    //fetch unsold items
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for(uint i=0; i< itemCount; i++){
            if (idToMarketItem[i + 1].owner == address(0)){
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem memory currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;

    }

    //fetch how many items that user bought
    function fetchMyNFTs() public view returns (MarketItem[] memory){
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++){
            if(idToMarketItem[i + 1].owner == msg.sender){
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint i = 0; i < totalItemCount; i++){
            if(idToMarketItem[i + 1].owner == msg.sender){
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem memory currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //fetch how many items the user created
    function fetchItemsCreated() public view returns (MarketItem[] memory){
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++){
            if (idToMarketItem[i + 1].seller == msg.sender){
                itemCount += 1;
            }
        } 

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint i =0; i < totalItemCount; i++){
            if (idToMarketItem[i + 1].seller == msg.sender){
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem memory currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}