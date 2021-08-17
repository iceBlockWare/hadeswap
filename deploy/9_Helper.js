
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    const chainId = await getChainId();
    // IMasterChef chef_,
    //     address maker_,
    //     IERC20 sushi_,
    //     IERC20 WETH_,
    //     IERC20 WBTC_,
    //     IFactory sushiFactory_,
    //     IFactory uniV2Factory_,
    //     IERC20 bar_
    const chefAddress = (await deployments.get("Plutus")).address;
    const makerAddress = "0x0000000000000000000000000000000000000000";
    const soulAddress = (await deployments.get("SoulToken")).address;
    const wethAddress = (await deployments.get("WETH9")).address;
    const wBTCAddress = "0x0000000000000000000000000000000000000000";
    const factoryAddress = (await deployments.get("UniswapV2Factory")).address;
    const barAddress = "0x0000000000000000000000000000000000000000";

    await deploy("BoringHelperV1", {
        from: deployer,
        args: [chefAddress, makerAddress, soulAddress, wethAddress, wBTCAddress, factoryAddress, factoryAddress, barAddress],
        log: true,
        deterministicDeployment: false,
    });
};

module.exports.tags = ["Helper", "AMM"];
module.exports.dependencies = ["UniswapV2Factory", "Plutus", "SoulToken", "WETH9"];
