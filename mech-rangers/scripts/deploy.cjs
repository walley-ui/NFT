const { createWalletClient, createPublicClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");
const hre = require("hardhat");

async function main() {
  const privateKey = "MY PRIVATE KEY";
  const account = privateKeyToAccount(privateKey);
  const rpcUrl = process.env.BASE_RPC_URL || "https://sepolia.base.org";

  console.log("Initializing clients for:", account.address);

  // 1. Setup Clients
  const publicClient = createPublicClient({ 
    chain: baseSepolia, 
    transport: http(rpcUrl) 
  });

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(rpcUrl)
  });

  // 2. Deploy
  console.log("Deploying MechRangers...");
  const hash = await walletClient.deployContract({
    abi: (await hre.artifacts.readArtifact("MechRangers")).abi,
    bytecode: (await hre.artifacts.readArtifact("MechRangers")).bytecode,
    args: ["ipfs://QmPlaceholderCID_MechRangers_Initial/"],
    gas: 3500000n,
  });

  console.log(" Transaction sent! Hash:", hash);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(" MechRangers deployed to:", receipt.contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
