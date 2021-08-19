const { WETH } = require("@sushiswap/sdk")

module.exports = async function ({ ethers: { getNamedSigner }, getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId()

  const factory = await deployments.get("UniswapV2Factory")
  const bar = await deployments.get("SushiBar")
  const sushi = await deployments.get("SushiToken")
  const weth = await deployments.get("WETH9Mock")

  await deploy("SushiMaker", {
    from: deployer,
    args: [factory.address, bar.address, sushi.address, weth.address],
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