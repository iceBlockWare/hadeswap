const { WETH } = require("@sushiswap/sdk");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();

  let wethAddress;

  if (chainId === "31337") {
    wethAddress = (await deployments.get("WETH9")).address;
  } // Sparta use case
  else if (chainId === "333888"){
    // deploy?
    // wethAddress = "0x34b99C2a4a4620F10ac779c36b8c61F90FD61732";
    wethAddress = (await deployments.get("WETH9")).address;
  } else if (chainId in WETH) {
    wethAddress = WETH[chainId].address;
  } else {
    throw Error("No WETH!");
  }

  const factoryAddress = (await deployments.get("UniswapV2Factory")).address;

  await deploy("UniswapV2Router02", {
    from: deployer,
    args: [factoryAddress, wethAddress],
    log: true,
    deterministicDeployment: false,
  });
};

module.exports.tags = ["UniswapV2Router02", "AMM"];
module.exports.dependencies = ["UniswapV2Factory", "WETH9"];
