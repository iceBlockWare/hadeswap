const { WETH } = require("@sushiswap/sdk")

module.exports = async function ({ ethers: { getNamedSigner }, getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()
  console.log("\n\nDeployer: ", deployer);
  console.log("Dev: ", dev);

  await deploy("WETH9Mock", {
    from: deployer,
    log: true,
  })
  console.log("\n\n***********Deployed WETH**********\n\n");

  const chainId = await getChainId()

  console.log("ChainId where deploying: ", chainId);

  const factory = await ethers.getContract("UniswapV2Factory")
  const bar = await ethers.getContract("SushiBar")
  const sushi = await ethers.getContract("SushiToken")
  
  const wethAddress = await ethers.getContract("WETH9Mock")
  
  console.log("wethAddress", wethAddress.address);
  
  // let wethAddress;
  
  // if (chainId === '31337') {
  //   wethAddress = (await deployments.get("WETH9Mock")).address
  // } else if (chainId in WETH) {
  //   wethAddress = WETH[chainId].address
  // } else {
  //   throw Error("No WETH!")
  // }

  await deploy("SushiMaker", {
    from: deployer,
    args: [factory.address, bar.address, sushi.address, wethAddress.address],
    log: true,
    deterministicDeployment: false
  })

  const maker = await ethers.getContract("SushiMaker")
  if (await maker.owner() !== dev) {
    console.log("Setting maker owner")
    await (await maker.transferOwnership(dev, true, false)).wait()
  }
}

module.exports.tags = ["SushiMaker"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SushiBar", "SushiToken"]