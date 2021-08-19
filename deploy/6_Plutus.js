
module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments

    const { deployer, dev } = await getNamedAccounts()

    const soul = await ethers.getContract("SoulToken")

    const chainId = await getChainId();

    // Mint if testnet
    if (chainId === "333888" || chainId === "3"){
        console.log("testnet minting")
        await soul.mint(deployer, '1000000000000000000000')
    }

    const { address } = await deploy("Plutus", {
        from: deployer,
        args: [soul.address, dev, "1000000000000000000", "100000"],
        log: true,
        deterministicDeployment: false
    })

    const plutus = await ethers.getContract("Plutus")

    if (await soul.owner() !== address) {
        // Transfer Sushi Ownership to Chef
        console.log("Transfer Soul Ownership to Plutus")
        await (await soul.proposeOwner(address)).wait()
        await (await plutus.claimToken(soul.address)).wait()
    }

    if (await plutus.owner() !== dev) {
        // Transfer ownership of Plutus to dev
        console.log("Transfer ownership of Plutus to dev")
        await (await plutus.proposeOwner(dev)).wait()
        // Call claim on explorer from dev account
        // await (await plutus.connect(dev).claimOwnership({from:dev})).wait()
    }
}

module.exports.tags = ["Plutus"]
module.exports.dependencies = ["SoulToken"]