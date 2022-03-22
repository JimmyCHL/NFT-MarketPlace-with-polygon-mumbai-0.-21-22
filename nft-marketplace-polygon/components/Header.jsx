import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <div>
      <nav className="border-b p-4">
        <p className="text-4xl font-bold">Jimmy Build NFT Marketplace</p>
        <div className="flex flex-wrap mt-1">
          <Link href="/">
            <span className="mr-3 px-2 py-2 rounded-full text-pink-500 font-[500] cursor-pointer hover:bg-pink-500 hover:text-white">
              Home
            </span>
          </Link>
          <Link href="/create-item">
            <span className="mr-3 px-2 py-2 rounded-full text-pink-500 font-[500] cursor-pointer hover:bg-pink-500 hover:text-white">
              Sell Digital Asset
            </span>
          </Link>
          <Link href="/my-assets">
            <span className="mr-3 px-2 py-2 rounded-full text-pink-500 font-[500] cursor-pointer hover:bg-pink-500 hover:text-white">
              My Digital Assets
            </span>
          </Link>
          <Link href="/creator-dashboard">
            <span className="mr-3 px-2 py-2 rounded-full text-pink-500 font-[500] cursor-pointer hover:bg-pink-500 hover:text-white">
              Creator Dashboard
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Header;
