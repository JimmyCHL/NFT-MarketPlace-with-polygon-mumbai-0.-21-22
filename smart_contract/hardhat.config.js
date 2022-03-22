require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    networks: {
        hardhat: {
            chainId: 1337,
        },
        mumbai: {
            url: process.env.INFURA_POLYGON_URL,
            accounts: [process.env.ACCOUNT_PRIVATE_KEY],
        },
    },
    solidity: "0.8.4",
};