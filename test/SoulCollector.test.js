const {expect} = require("chai");
const { prepare, deploy, getBigNumber, createSLP } = require("./utilities");

describe("SoulCollector", function () {
    before(async function () {
        await prepare(this, ["SoulCollector", "ERC20Mock", "UniswapV2Factory", "UniswapV2Pair"])
    })

    beforeEach(async function () {
        await deploy(this, [
            ["soul", this.ERC20Mock, ["SOUL", "SOUL", getBigNumber("10000000")]],
            ["dai", this.ERC20Mock, ["DAI", "DAI", getBigNumber("10000000")]],
            ["mic", this.ERC20Mock, ["MIC", "MIC", getBigNumber("10000000")]],
            ["usdc", this.ERC20Mock, ["USDC", "USDC", getBigNumber("10000000")]],
            ["wpolis", this.ERC20Mock, ["WETH", "ETH", getBigNumber("10000000")]],
            ["strudel", this.ERC20Mock, ["$TRDL", "$TRDL", getBigNumber("10000000")]],
            ["factory", this.UniswapV2Factory, [this.alice.address]],
        ])
        // "0x0000000000000000000000000000000000000000"
        await deploy(this, [["soulCollector", this.SoulCollector, [this.factory.address, this.alice.address , this.soul.address, this.wpolis.address]]])
        // await deploy(this, [["exploiter", this.SoulMakerExploitMock, [this.soulCollector.address]]])
        await createSLP(this, "soulPolis", this.soul, this.wpolis, getBigNumber(10))
        await createSLP(this, "strudelPolis", this.strudel, this.wpolis, getBigNumber(10))
        await createSLP(this, "daiPolis", this.dai, this.wpolis, getBigNumber(10))
        await createSLP(this, "usdcPolis", this.usdc, this.wpolis, getBigNumber(10))
        await createSLP(this, "micUSDC", this.mic, this.usdc, getBigNumber(10))
        await createSLP(this, "soulUSDC", this.soul, this.usdc, getBigNumber(10))
        await createSLP(this, "daiUSDC", this.dai, this.usdc, getBigNumber(10))
        await createSLP(this, "daiMIC", this.dai, this.mic, getBigNumber(10))
    })
    describe("setBridge", function () {
        it("does not allow to set bridge for Soul", async function () {
            await expect(this.soulCollector.setBridge(this.soul.address, this.wpolis.address)).to.be.revertedWith("SoulCollector: Invalid bridge")
        })

        it("does not allow to set bridge for WETH", async function () {
            await expect(this.soulCollector.setBridge(this.wpolis.address, this.soul.address)).to.be.revertedWith("SoulCollector: Invalid bridge")
        })

        it("does not allow to set bridge to itself", async function () {
            await expect(this.soulCollector.setBridge(this.dai.address, this.dai.address)).to.be.revertedWith("SoulCollector: Invalid bridge")
        })

        it("emits correct event on bridge", async function () {
            await expect(this.soulCollector.setBridge(this.dai.address, this.soul.address))
                .to.emit(this.soulCollector, "LogBridgeSet")
                .withArgs(this.dai.address, this.soul.address)
        })
    })
    describe("convert", function () {
        it("should convert SOUL - ETH", async function () {
            await this.soulPolis.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulCollector.convert(this.soul.address, this.wpolis.address)
            expect(await this.soul.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soulPolis.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soul.balanceOf(this.alice.address)).to.equal("9999981897569270781234370")
        })

        it("should convert USDC - ETH", async function () {
            await this.usdcPolis.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulCollector.convert(this.usdc.address, this.wpolis.address)
            expect(await this.soul.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.usdcPolis.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soul.balanceOf(this.alice.address)).to.equal("9999981590898251382934275")
        })

        it("should convert $TRDL - ETH", async function () {
            await this.strudelPolis.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulCollector.convert(this.strudel.address, this.wpolis.address)
            expect(await this.soul.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.strudelPolis.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soul.balanceOf(this.alice.address)).to.equal("9999981590898251382934275")
        })

        it("should convert USDC - SOUL", async function () {
            await this.soulUSDC.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulCollector.convert(this.usdc.address, this.soul.address)
            expect(await this.soul.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soulUSDC.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soul.balanceOf(this.alice.address)).to.equal("9999981897569270781234370")
        })

        it("should convert using standard ETH path", async function () {
            await this.daiPolis.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulCollector.convert(this.dai.address, this.wpolis.address)
            expect(await this.soul.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.daiPolis.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soul.balanceOf(this.alice.address)).to.equal("9999981590898251382934275")
        })

        it("converts MIC/USDC using more complex path", async function () {
            await this.micUSDC.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulCollector.setBridge(this.usdc.address, this.soul.address)
            await this.soulCollector.setBridge(this.mic.address, this.usdc.address)
            await this.soulCollector.convert(this.mic.address, this.usdc.address)
            expect(await this.soul.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.micUSDC.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soul.balanceOf(this.alice.address)).to.equal("9999981590898251382934275")
        })

        it("converts DAI/USDC using more complex path", async function () {
            await this.daiUSDC.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulCollector.setBridge(this.usdc.address, this.soul.address)
            await this.soulCollector.setBridge(this.dai.address, this.usdc.address)
            await this.soulCollector.convert(this.dai.address, this.usdc.address)
            expect(await this.soul.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.daiUSDC.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soul.balanceOf(this.alice.address)).to.equal("9999981590898251382934275")
        })

        it("converts DAI/MIC using two step path", async function () {
            await this.daiMIC.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulCollector.setBridge(this.dai.address, this.usdc.address)
            await this.soulCollector.setBridge(this.mic.address, this.dai.address)
            await this.soulCollector.convert(this.dai.address, this.mic.address)
            expect(await this.soul.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.daiMIC.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soul.balanceOf(this.alice.address)).to.equal("9999981200963016721363748")
        })

        it("reverts if it loops back", async function () {
            await this.daiMIC.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulCollector.setBridge(this.dai.address, this.mic.address)
            await this.soulCollector.setBridge(this.mic.address, this.dai.address)
            await expect(this.soulCollector.convert(this.dai.address, this.mic.address)).to.be.reverted
        })

        // it("reverts if caller is not EOA", async function () {
        //     await this.soulPolis.transfer(this.soulCollector.address, getBigNumber(1))
        //     await expect(this.exploiter.convert(this.soul.address, this.wpolis.address)).to.be.revertedWith("SoulMaker: must use EOA")
        // })

        it("reverts if pair does not exist", async function () {
            await expect(this.soulCollector.convert(this.mic.address, this.micUSDC.address)).to.be.revertedWith("SoulCollector: Invalid pair")
        })

        it("reverts if no path is available", async function () {
            await this.micUSDC.transfer(this.soulCollector.address, getBigNumber(1))
            await expect(this.soulCollector.convert(this.mic.address, this.usdc.address)).to.be.revertedWith("SoulCollector: Cannot convert")
            expect(await this.soul.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.micUSDC.balanceOf(this.soulCollector.address)).to.equal(getBigNumber(1))
            expect(await this.soul.balanceOf(this.alice.address)).to.equal('9999980000000000000000000')
        })
    })

    describe("convertMultiple", function () {
        it("should allow to convert multiple", async function () {
            await this.daiPolis.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulPolis.transfer(this.soulCollector.address, getBigNumber(1))
            await this.soulCollector.convertMultiple([this.dai.address, this.soul.address], [this.wpolis.address, this.wpolis.address])
            expect(await this.soul.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.daiPolis.balanceOf(this.soulCollector.address)).to.equal(0)
            expect(await this.soul.balanceOf(this.alice.address)).to.equal("9999983186583558687783097")
        })
    })
})