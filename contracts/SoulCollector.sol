// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./uniswapv2/interfaces/IUniswapV2ERC20.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./uniswapv2/interfaces/IUniswapV2Factory.sol";

import "./Ownable.sol";

// SoulCollector helps Hades to collect Souls around the underworld.
// This contract handles trades tokens collected from fees to Soul. Then sends them to a specific address.

contract SoulCollector is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IUniswapV2Factory public immutable factory;
    address public destination;
    address private immutable soul;
    address private immutable wpolis;
    mapping(address => address) internal _bridges;

    event LogBridgeSet(address indexed token, address indexed bridge);

    event LogConvert(
        address indexed server,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 amountSOUL
    );

    constructor(
        address _factory,
        address _destination,
        address _soul,
        address _wpolis
    ) public {
        factory = IUniswapV2Factory(_factory);
        destination = _destination;
        soul = _soul;
        wpolis = _wpolis;
    }


    function bridgeFor(address token) public view returns (address bridge) {
        bridge = _bridges[token];
        if (bridge == address(0)) {
            bridge = wpolis;
        }
    }

    function setBridge(address token, address bridge) external onlyOwner {
        // Checks
        require(
            token != soul && token != wpolis && token != bridge,
            "SoulCollector: Invalid bridge"
        );

        // Effects
        _bridges[token] = bridge;
        emit LogBridgeSet(token, bridge);
    }

    modifier onlyEOA() {
        // Try to make flash-loan exploit harder to do by only allowing externally owned addresses.
        require(msg.sender == tx.origin, "SoulCollector: must use EOA");
        _;
    }

    function convert(address token0, address token1) external onlyEOA() {
        _convert(token0, token1);
    }


    function convertMultiple(
        address[] calldata token0,
        address[] calldata token1
    ) external onlyEOA() {
        uint256 len = token0.length;
        for (uint256 i = 0; i < len; i++) {
            _convert(token0[i], token1[i]);
        }
    }


    function _convert(address token0, address token1) internal {
        // Interactions
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(token0, token1));
        require(address(pair) != address(0), "SoulCollector: Invalid pair");

        IERC20(address(pair)).safeTransfer(
            address(pair),
            pair.balanceOf(address(this))
        );

        (uint256 amount0, uint256 amount1) = pair.burn(address(this));
        if (token0 != pair.token0()) {
            (amount0, amount1) = (amount1, amount0);
        }
        emit LogConvert(
            msg.sender,
            token0,
            token1,
            amount0,
            amount1,
            _convertStep(token0, token1, amount0, amount1)
        );
    }

    // All safeTransfer, _swap, _toSOUL, _convertStep
    function _convertStep(
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
    ) internal returns (uint256 soulOut) {
        // Interactions
        if (token0 == token1) {
            uint256 amount = amount0.add(amount1);
            if (token0 == soul) {
                IERC20(soul).safeTransfer(destination, amount);
                soulOut = amount;
            } else if (token0 == wpolis) {
                soulOut = _toSOUL(wpolis, amount);
            } else {
                address bridge = bridgeFor(token0);
                amount = _swap(token0, bridge, amount, address(this));
                soulOut = _convertStep(bridge, bridge, amount, 0);
            }
        } else if (token0 == soul) {
            // eg. SOUL - ETH
            IERC20(soul).safeTransfer(destination, amount0);
            soulOut = _toSOUL(token1, amount1).add(amount0);
        } else if (token1 == soul) {
            // eg. USDT - SOUL
            IERC20(soul).safeTransfer(destination, amount1);
            soulOut = _toSOUL(token0, amount0).add(amount1);
        } else if (token0 == wpolis) {
            // eg. ETH - USDC
            soulOut = _toSOUL(
                wpolis,
                _swap(token1, wpolis, amount1, address(this)).add(amount0)
            );
        } else if (token1 == wpolis) {
            // eg. USDT - ETH
            soulOut = _toSOUL(
                wpolis,
                _swap(token0, wpolis, amount0, address(this)).add(amount1)
            );
        } else {
            // eg. MIC - USDT
            address bridge0 = bridgeFor(token0);
            address bridge1 = bridgeFor(token1);
            if (bridge0 == token1) {
                // eg. MIC - USDT - and bridgeFor(MIC) = USDT
                soulOut = _convertStep(
                    bridge0,
                    token1,
                    _swap(token0, bridge0, amount0, address(this)),
                    amount1
                );
            } else if (bridge1 == token0) {
                // eg. WBTC - DSD - and bridgeFor(DSD) = WBTC
                soulOut = _convertStep(
                    token0,
                    bridge1,
                    amount0,
                    _swap(token1, bridge1, amount1, address(this))
                );
            } else {
                soulOut = _convertStep(
                    bridge0,
                    bridge1, // eg. USDT - DSD - and bridgeFor(DSD) = WBTC
                    _swap(token0, bridge0, amount0, address(this)),
                    _swap(token1, bridge1, amount1, address(this))
                );
            }
        }
    }

    // All safeTransfer, swap
    function _swap(
        address fromToken,
        address toToken,
        uint256 amountIn,
        address to
    ) internal returns (uint256 amountOut) {
        // Checks
        IUniswapV2Pair pair =
        IUniswapV2Pair(factory.getPair(fromToken, toToken));
        require(address(pair) != address(0), "SoulCollector: Cannot convert");

        // Interactions
        (uint256 reserve0, uint256 reserve1, ) = pair.getReserves();
        uint256 amountInWithFee = amountIn.mul(997);
        if (fromToken == pair.token0()) {
            amountOut =
            amountInWithFee.mul(reserve1) /
            reserve0.mul(1000).add(amountInWithFee);
            IERC20(fromToken).safeTransfer(address(pair), amountIn);
            pair.swap(0, amountOut, to, new bytes(0));
        } else {
            amountOut =
            amountInWithFee.mul(reserve0) /
            reserve1.mul(1000).add(amountInWithFee);
            IERC20(fromToken).safeTransfer(address(pair), amountIn);
            pair.swap(amountOut, 0, to, new bytes(0));
        }
    }

    function _toSOUL(address token, uint256 amountIn)
    internal
    returns (uint256 amountOut)
    {
        amountOut = _swap(token, soul, amountIn, destination);
    }

}
