// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./SoulToken.sol";
import "./Drachma.sol";


contract Plutus is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        //
        // We do some fancy math here. Basically, any point in time, the amount of SOULs
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accSoulPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accSoulPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }
    // Info of each pool.
    struct PoolInfo {
        IERC20 lpToken; // Address of LP token contract.
        uint256 allocPoint; // How many allocation points assigned to this pool. SOULs to distribute per block.
        uint256 lastRewardBlock; // Last block number that SOULs distribution occurs.
        uint256 accSoulPerShare; // Accumulated SOULs per share, times 1e12. See below.
    }
    // The Soul Token
    SoulToken public soul;
    // The Drachma token
    Drachma public immutable drachma;
    // Dev address.
    address public devaddr;
    // SOUL tokens created per block.
    uint256 public soulPerBlock;
    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block number when SOUL mining starts.
    uint256 public startBlock;
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    constructor(
        SoulToken _soul,
        Drachma _drachma,
        address _devaddr,
        uint256 _soulPerBlock,
        uint256 _startBlock
    ) public {
        soul = _soul;
        drachma = _drachma;
        devaddr = _devaddr;
        soulPerBlock = _soulPerBlock;
        startBlock = _startBlock;
    }

    // Add a new lp to the pool.
    function add(uint256 _allocPoint, IERC20 _lpToken) public onlyOwner {
        checkPoolDuplicate(_lpToken);
        massUpdatePools();
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accSoulPerShare: 0
            })
        );
    }

    // Update the given pool's SOUL allocation point.
    function set( uint256 _pid, uint256 _allocPoint) public onlyOwner {
        massUpdatePools();
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(_allocPoint);
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    // View function to see pending SOULs on frontend.
    function pendingSoul(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accSoulPerShare = pool.accSoulPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = block.number.sub(pool.lastRewardBlock);
            uint256 soulReward = multiplier.mul(soulPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
            accSoulPerShare = accSoulPerShare.add(soulReward.mul(1e12).div(lpSupply));
        }
        return user.amount.mul(accSoulPerShare).div(1e12).sub(user.rewardDebt);
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = block.number.sub(pool.lastRewardBlock);
        uint256 soulReward =
        multiplier.mul(soulPerBlock).mul(pool.allocPoint).div(
            totalAllocPoint
        );
        soul.mint(devaddr, soulReward.div(10));
        soul.mint(address(this), soulReward);
        pool.accSoulPerShare = pool.accSoulPerShare.add(
            soulReward.mul(1e12).div(lpSupply)
        );
        pool.lastRewardBlock = block.number;
    }

    // Deposit LP tokens for SOUL allocation
    function deposit(uint256 _pid, uint256 _amount) public {
        require ( _pid < poolInfo.length , "deposit: pool does not exist");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = user.amount.mul(pool.accSoulPerShare).div(1e12).sub(user.rewardDebt);
            if (pending > 0) {
                safeSoulTransfer(msg.sender, pending);
            }
        }
        // Now take care of the new deposit
        if(_amount > 0) {
            pool.lpToken.safeTransferFrom(
                address(msg.sender),
                address(this),
                _amount
            );
            user.amount = user.amount.add(_amount);
            if (_pid == 0) {
                // The first pool gives governance
                drachma.mint(address(msg.sender), _amount);
            }
        }
        user.rewardDebt = user.amount.mul(pool.accSoulPerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount);
    }

    // Withdraw LP tokens.
    function withdraw(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: invalid amount");
        updatePool(_pid);
        uint256 pending = user.amount.mul(pool.accSoulPerShare).div(1e12).sub(user.rewardDebt);
        if(pending > 0) {
            safeSoulTransfer(msg.sender, pending);
        }
        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
            if (_pid == 0) {
                // Burn the drachma from user
                drachma.burn(address(msg.sender), _amount);
            }
        }
        user.rewardDebt = user.amount.mul(pool.accSoulPerShare).div(1e12);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 _amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        pool.lpToken.safeTransfer(address(msg.sender), _amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
    }

    // Safe soul transfer function, just in case if rounding error causes pool to not have enough SOULs.
    function safeSoulTransfer(address _to, uint256 _amount) internal {
        uint256 soulBal = soul.balanceOf(address(this));
        if (_amount > soulBal) {
            IERC20(soul).safeTransfer(_to, soulBal);
        } else {
            IERC20(soul).safeTransfer(_to, _amount);
        }
    }

    // Update dev address
    function dev(address _devaddr) public onlyOwner {
        devaddr = _devaddr;
    }

    // Change soul per block. Affects rewards for all users.
    function changeSoulPerBlock(uint256 _amount) public onlyOwner {
        require(_amount > 0, "changeSoulPerBlock: invalid amount");
        massUpdatePools();
        soulPerBlock = _amount;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Helper function to check if a token has already been added as a reward.
    function checkPoolDuplicate (IERC20 _lpToken) public view {
        uint256 length = poolInfo.length;
        for(uint256 pid = 0; pid < length ; ++pid) {
            require (poolInfo[pid].lpToken != _lpToken , "add: existing pool?");
        }
    }

    // Propose ownership of soul to address
    function proposeSoulOwner(address _owner) public onlyOwner {
        soul.proposeOwner(_owner);
    }

    // Claim ownership of address
    function claimToken(address _token) public {
        Ownable(_token).claimOwnership();
    }
}