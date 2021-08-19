 module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments
  console.log("Deployeyments: ", deployments);

  const { deployer } = await getNamedAccounts()

  console.log("Deployer: ", deployer);

  await deploy("SushiToken", {
    from: deployer,
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["SushiToken"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02"]
