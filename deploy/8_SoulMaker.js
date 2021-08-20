const { WETH } = require("@sushiswap/sdk")

module.exports = async function ({ ethers: { getNamedSigner }, getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId()

  
  console.log("Deploying SoulMaker...");
  console.log("SoulMaker deployer: ", deployer);

  await deploy("WETH9Mock", {
    from: deployer,
    log: true,
  })

  const factory = await deployments.get("UniswapV2Factory")
  const bar = await deployments.get("SoulBar")
  const soul = await deployments.get("SoulToken")
  const weth = await deployments.get("WETH9Mock")

  await deploy("SoulMaker", {
    from: deployer,
    args: [factory.address, bar.address, soul.address, weth.address],
    log: true,
    deterministicDeployment: false
  })

  const maker = await ethers.getContract("SoulMaker")
  if (await maker.owner() !== dev) {
    console.log("Setting maker owner")
    await (await maker.transferOwnership(dev, true, false)).wait()
  }
}

module.exports.tags = ["SoulMaker"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SoulBar", "SoulToken"]