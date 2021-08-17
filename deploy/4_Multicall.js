// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({
                                     getNamedAccounts,
                                     deployments,
                                 }) {
    const { deploy } = deployments;

    const { deployer, dev } = await getNamedAccounts();

    const chainId = await getChainId();

    // deploy some test tokens
    if (chainId === "333888"){
        await deploy("Multicall", {
          from: deployer,
          log: true,
          deterministicDeployment: false,
        });
        // await deploy("ERC20Mock", {
        //   from: deployer,
        //   args: ["TOKEN 2", "TOK2", '100000000000000000000000'],
        //   log: true,
        //   deterministicDeployment: false,
        // });
        // await deploy("ERC20Mock", {
        //   from: deployer,
        //   args: ["TOKEN 3", "TOK3", '100000000000000000000000'],
        //   log: true,
        //   deterministicDeployment: false,
        // });
    }
};

module.exports.tags = ["Multicall", "AMM"];
