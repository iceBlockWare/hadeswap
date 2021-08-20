// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "hardhat/console.sol";

// SoulBar is the coolest bar in town. 
//You come in with some Soul, and leave with more! The longer you stay, the more Soul you get.
//
// This contract handles swapping to and from xSoul, SoulSwap's staking token.
contract SoulBar is ERC20("SoulBar", "xSOUL"){
    using SafeMath for uint256;
    IERC20 public soul;

    // Define the Soul token contract
    constructor(IERC20 _soul) public {
        soul = _soul;
    }

    // Enter the bar. Pay some SOULs. Earn some shares.
    // Locks Soul and mints xSoul
    function enter(uint256 _amount) public {
        // Gets the amount of Soul locked in the contract
        uint256 totalSoul = soul.balanceOf(address(this));
        // Gets the amount of xSoul in existence
        uint256 totalShares = totalSupply();
        // If no xSoul exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalSoul == 0) {
            _mint(msg.sender, _amount);
        } 
        // Calculate and mint the amount of xSoul the Soul is worth. 
        //The ratio will change overtime, as xSoul is burned/minted and Soul deposited + gained from fees / withdrawn.
        else {
            uint256 what = _amount.mul(totalShares).div(totalSoul);
            _mint(msg.sender, what);
        }
        // Lock the Soul in the contract
        soul.transferFrom(msg.sender, address(this), _amount);
    }

    // Leave the bar. Claim back your SOULs.
    // Unlocks the staked + gained Soul and burns xSoul
    function leave(uint256 _share) public {
        // Gets the amount of xSoul in existence
        uint256 totalShares = totalSupply();
        // Calculates the amount of Soul the xSoul is worth
        uint256 what = _share.mul(soul.balanceOf(address(this))).div(totalShares);
        _burn(msg.sender, _share);
        soul.transfer(msg.sender, what);
    }
}
