
const hre = require("hardhat");
const Factory = artifacts.require("UniswapV2Factory");
const Router = artifacts.require("UniswapV2Router02");
const Weth = artifacts.require("WETH9Mock");
const Token = artifacts.require("ERC20Mock");
const Plutus = artifacts.require("Plutus");
// const Chef = artifacts.require("MasterChef");
const Soul = artifacts.require("SoulToken");
// const Sushi = artifacts.require("SushiToken");
const Helper = artifacts.require("BoringHelperV1")

async function main() {

    let accounts = await ethers.provider.listAccounts();
    console.log((await ethers.provider.getBalance(accounts[0])).toString());

    // let uniRouter = await Router.at("0xa814154782D7E4aCF4B4c63B6586F2cC3db4cc81")
    // let uniFactory = await Factory.at("");
    let weth =  await Weth.at("0xC614405267eCDbF01FB5b425e3F2EC657160101A");
    // let usdt = await Token.at("");
    // let dai = await Token.at("0x147CE2808D1D01cbB85EA6A71d4ba8D0bEFe8326");
    // let usdc = await Token.at("");
    //
    // let plutus = await Plutus.at("0x1F1FD6295AF1cD0A6200fAB4Be685aFE34b3a903");
    // let masterChef = await Chef.at("");
    //
    // let soul = await Soul.at("0xE85164Fb4FBF778dc49bb66C5b749115f04ef560");
    // let sushi = await Sushi.at("");

    // let helper = await Helper.at("0x7aDcf7F865b0029cB4ebe010203292347Dd34F2B")


    let deployeador = accounts[0];

    // console.log((await helper.getPools([0, 1, 2, 3, 4])));

    let timestamp = Math.floor(Date.now() / 1000) + 300;
    // 0x808aCc5cF1576B01D28Fd89340174A8973FFA7C0 200000000000000000000 200000000000000000000 100000000000000000 0xa7562DA25C745ef83EF7d295a12a59e911eF50D0 0x61023148
    // console.log("approves");
    // // await usdt.approve(uniRouter.address, '10000000000000000000000000');
    // await dai.approve(uniRouter.address, '10000000000000000000000000');
    // // await usdc.approve(uniRouter.address, '10000000000000000000000000');
    // await soul.approve(uniRouter.address, '10000000000000000000000000');
    // // await sushi.approve(uniRouter.address, '10000000000000000000000000');
    //
    //
    // console.log("deposits");
    await weth.deposit({ value: '2000000000000000000'});
    // console.log('dai-weth');
    // await uniRouter.addLiquidityETH(dai.address, '315000000000000000000',
    //     '315000000000000000000', '100000000000000000', '0xa7562DA25C745ef83EF7d295a12a59e911eF50D0', timestamp, {value: '100000000000000000'});
    // console.log('soul-weth');
    // await uniRouter.addLiquidityETH(soul.address, '1000000000000000000',
    //     '1000000000000000000', '100000000000000000', '0xa7562DA25C745ef83EF7d295a12a59e911eF50D0', timestamp, {value: '100000000000000000'});
    // console.log('soul-dai');
    // await uniRouter.addLiquidity(soul.address, dai.address, '1000000000000000000',
    //     '315000000000000000000', '1000000000000000000', '315000000000000000000','0xa7562DA25C745ef83EF7d295a12a59e911eF50D0', timestamp);
    // console.log("chefs")
    // await plutus.add(10, "");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });