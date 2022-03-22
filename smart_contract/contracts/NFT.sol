//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";//require for all compliant
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; //allow us to use _setTokenURI
// ERC721URIStorage actually inherited from ERC721. It offer more flexible but expensive way to store metadata in storage.
import "@openzeppelin/contracts/utils/Counters.sol"; // increment number


contract NFT is ERC721URIStorage{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds; //default would be 0

    address contractAddress;

    constructor(address marketplaceAddress) ERC721 ("Metaverse Tokens", "METT"){
        contractAddress = marketplaceAddress;
        
    }

    function createToken (string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        //give the marketplace the approval to transact the token for the caller!!
        setApprovalForAll(contractAddress, true);

        return newItemId;
    }
}