module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy } = deployments
  
    const { deployer } = await getNamedAccounts()
  
    console.log("Deploying SushiBar...");
    console.log("SushiBar deployer: ", deployer);

    await deploy("SushiToken", {
      from: deployer,
      log: true,
      deterministicDeployment: false
  })
  
    const sushi = await deployments.get("SushiToken")
  
    await deploy("SushiBar", {
      from: deployer,
      args: [sushi.address],
      log: true,
      deterministicDeployment: false
    })
  }
  
  module.exports.tags = ["SushiBar"]
  module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SushiToken"]
  