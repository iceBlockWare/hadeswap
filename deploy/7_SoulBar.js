module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy } = deployments
  
    const { deployer } = await getNamedAccounts()
  
    console.log("Deploying SoulBar...");
    console.log("SoulBar deployer: ", deployer);
  
    const soul = await ethers.getContract("SoulToken")
    
    const chainId = await getChainId();
  
    await deploy("SoulBar", {
      from: deployer,
      args: [soul.address],
      log: true,
      deterministicDeployment: false
    })
  }
  
  module.exports.tags = ["SoulBar"]
  module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SoulToken"]
  