
module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments

    const { deployer, dev } = await getNamedAccounts()

    const sushi = await ethers.getContract("SoulToken")

    const chainId = await getChainId();

    // Mint if testnet
    if (chainId === "333888" || chainId === "3"){
        console.log("testnet minting")
        // await sushi.mint(deployer, '1000000000000000000000')
    }

    const { address } = await deploy("Plutus", {
        from: deployer,
        args: [sushi.address, dev, "1000000000000000000000", "0", "0"],
        log: true,
        deterministicDeployment: false
    })

    if (await sushi.owner() !== address) {
        // Transfer Sushi Ownership to Chef
        console.log("Transfer Sushi Ownership to Chef")
        await (await sushi.transferOwnership(address)).wait()
    }

    const masterChef = await ethers.getContract("Plutus")
    if (await masterChef.owner() !== dev) {
        // Transfer ownership of MasterChef to dev
        console.log("Transfer ownership of Plutus to dev")
        await (await masterChef.transferOwnership(dev)).wait()
    }
}

module.exports.tags = ["Plutus"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SoulToken"]