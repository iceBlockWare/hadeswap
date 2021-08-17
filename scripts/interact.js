
const hre = require("hardhat");
const Factory = artifacts.require("UniswapV2Factory");
const Router = artifacts.require("UniswapV2Router02");
const Weth = artifacts.require("WETH9Mock");
const Token = artifacts.require("ERC20Mock");
const Plutus = artifacts.require("Plutus");
const Chef = artifacts.require("MasterChef");
const Soul = artifacts.require("SoulToken");
const Sushi = artifacts.require("SushiToken");


async function main() {

    let accounts = await ethers.provider.listAccounts();
    console.log((await ethers.provider.getBalance(accounts[0])).toString());

    let uniRouter = await Router.at("")
    let uniFactory = await Factory.at("");
    let weth =  await Weth.at("");
    let usdt = await Token.at("");
    let dai = await Token.at("");
    let usdc = await Token.at("");

    let plutus = await Plutus.at("");
    let masterChef = await Chef.at("");

    let soul = await Soul.at("");
    let sushi = await Sushi.at("");


    let deployeador = accounts[0];

    let timestamp = Math.floor(Date.now() / 1000) + 300;
    // 0x808aCc5cF1576B01D28Fd89340174A8973FFA7C0 200000000000000000000 200000000000000000000 100000000000000000 0xa7562DA25C745ef83EF7d295a12a59e911eF50D0 0x61023148
    console.log("approves");
    // await usdt.approve(uniRouter.address, '10000000000000000000000000');
    // await dai.approve(uniRouter.address, '10000000000000000000000000');
    // await usdc.approve(uniRouter.address, '10000000000000000000000000');
    // await soul.approve(uniRouter.address, '10000000000000000000000000');
    // await sushi.approve(uniRouter.address, '10000000000000000000000000');


    console.log("deposits");
    // await weth.deposit({ value: '2000000000000000000'});
    // console.log('usdt-weth');
    // await uniRouter.addLiquidityETH(usdt.address, '3150000000000000000000',
    //     '3150000000000000000000', '1000000000000000000', '0xa7562DA25C745ef83EF7d295a12a59e911eF50D0', timestamp, {value: '1000000000000000000'});
    // console.log('usdc-weth');
    // await uniRouter.addLiquidityETH(usdc.address, '3150000000000000000000',
    //     '3150000000000000000000', '1000000000000000000', '0xa7562DA25C745ef83EF7d295a12a59e911eF50D0', timestamp, {value: '1000000000000000000'});
    // console.log('dai-weth');
    // await uniRouter.addLiquidityETH(dai.address, '3150000000000000000000',
    //     '3150000000000000000000', '1000000000000000000', '0xa7562DA25C745ef83EF7d295a12a59e911eF50D0', timestamp, {value: '1000000000000000000'});
    console.log('soul-weth');
    await uniRouter.addLiquidityETH(soul.address, '10000000000000000000',
        '10000000000000000000', '1000000000000000000', '0xa7562DA25C745ef83EF7d295a12a59e911eF50D0', timestamp, {value: '1000000000000000000'});
    console.log('sushi-weth');
    await uniRouter.addLiquidityETH(sushi.address, '1000000000000000000',
        '1000000000000000000', '100000000000000000', '0xa7562DA25C745ef83EF7d295a12a59e911eF50D0', timestamp, {value: '100000000000000000'});
    console.log('soul-usdt');
    await uniRouter.addLiquidity(soul.address, usdt.address, '1000000000000000000', '315000000000000000000',
        '1000000000000000000', '315000000000000000000', '0xa7562DA25C745ef83EF7d295a12a59e911eF50D0', timestamp)
    console.log('suhsi-usdt');
    await uniRouter.addLiquidity(sushi.address, usdt.address, '1000000000000000000', '315000000000000000000',
        '1000000000000000000', '315000000000000000000', '0xa7562DA25C745ef83EF7d295a12a59e911eF50D0', timestamp)
    console.log("chefs")
    // await plutus.add(10, "", true);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });