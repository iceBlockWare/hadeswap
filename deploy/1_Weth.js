
module.exports = async function ({
  getNamedAccounts,
  deployments,
}) {
  const { deploy } = deployments;

  const { deployer, dev } = await getNamedAccounts();

  const chainId = await getChainId();

  await deploy("WPOLIS", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  // deploy some test tokens
 if (chainId === "333888" || chainId === "3"){
   // await deploy("ERC20Mock", {
   //   from: deployer,
   //   args: ["USDT", "USDT", '100000000000000000000000'],
   //   log: true,
   //   deterministicDeployment: false,
   // });
   // await deploy("ERC20Mock", {
   //   from: deployer,
   //   args: ["DAI", "DAI", '100000000000000000000000'],
   //   log: true,
   //   deterministicDeployment: false,
   // });
   // await deploy("ERC20Mock", {
   //   from: deployer,
   //   args: ["USDC", "USDC", '100000000000000000000000'],
   //   log: true,
   //   deterministicDeployment: false,
   // });
  }
};

module.exports.tags = ["WPOLIS", "AMM"];
