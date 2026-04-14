const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MechRangersModule", (m) => {
  const initialBaseURI = m.getParameter(
    "initialBaseURI", 
    "ipfs://QmPlaceholderCID_MechRangers_Initial/"
  );

  // We are passing a manual gasLimit here to override the 733810 bottleneck
  const mechRangers = m.contract("MechRangers", [initialBaseURI], {
    config: {
      gasLimit: 4000000n, 
    },
  });

  return { mechRangers };
});
