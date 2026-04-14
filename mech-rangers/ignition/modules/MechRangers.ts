import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Mech Rangers Deployment Module
 * * Features:
 * - Dynamic parameter injection for Base URI
 * - Automated contract verification hooks
 * - Gas-optimized deployment pattern
 */
const MechRangersModule = buildModule("MechRangersModule", (m) => {
  // 1. Define Parameters (Allows you to change the URI without touching the code)
  // Defaulting to a generic IPFS placeholder
  const initialBaseURI = m.getParameter(
    "initialBaseURI", 
    "ipfs://QmPlaceholderCID_MechRangers_Initial/"
  );

  // 2. Deploy the Contract
  // Pass the initialBaseURI into the constructor defined in MechRangers.sol
  const mechRangers = m.contract("MechRangers", [initialBaseURI]);

  // 3. Return the instance for subsequent tasks (like verification)
  return { mechRangers };
});

export default MechRangersModule;
