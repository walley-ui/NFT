require("@nomicfoundation/hardhat-ignition-viem");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    "base-sepolia": {
      url: process.env.BASE_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  },
  // Updated for Etherscan V2 API
  etherscan: {
    apiKey: process.env.BASESCAN_API_KEY,
  },
  sourcify: {
    enabled: false
  }
};
