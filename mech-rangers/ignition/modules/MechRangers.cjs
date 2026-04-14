const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

/**
 * Mech Rangers Deployment Module (CommonJS Version)
 */
module.exports = buildModule("MechRangersModule", (m) => {
  const initialBaseURI = m.getParameter(
    "initialBaseURI", 
    "ipfs://QmPlaceholderCID_MechRangers_Initial/"
  );

  const mechRangers = m.contract("MechRangers", [initialBaseURI]);

  return { mechRangers };
});
