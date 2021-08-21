const { WETH } = require("@sushiswap/sdk")

module.exports = async function ({ ethers: { getNamedSigner }, getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId()

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
    await (await maker.proposeOwner(dev)).wait()
  }

  
  const weth9 = await deployments.get("WETH9")
  const router = await deployments.get("UniswapV2Router02")
  const multicall = await deployments.get("Multicall")
  const drachma = await deployments.get("Drachma")
  const plutus = await deployments.get("Plutus")

  console.log("WETH9 aadress:\t\t\t", weth9.address);
  console.log("UniswapV2Factory aadress:\t", factory.address);
  console.log("UniswapV2Router02 aadress:\t", router.address);
  console.log("Multicall aadress:\t\t", multicall.address);
  console.log("SoulToken aadress:\t\t", soul.address);
  console.log("Drachma aadress:\t\t", drachma.address);
  console.log("Plutus aadress:\t\t\t", plutus.address);
  console.log("SoulBar aadress:\t\t", bar.address);
  console.log("WETH9Mock aadress:\t\t", weth.address);
  console.log("SoulMaker aadress:\t\t", maker.address);
}

module.exports.tags = ["SoulMaker"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SoulBar", "SoulToken"]