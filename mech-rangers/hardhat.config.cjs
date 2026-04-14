const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-ignition-viem");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "base-sepolia": {
      url: process.env.BASE_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      // Adjusted to fit your 0.068 ETH balance
      gas: 3500000, 
      gasPrice: 1500000000, // 1.5 gwei
    },
  },
};
