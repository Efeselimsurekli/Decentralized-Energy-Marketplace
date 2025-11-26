// SPDX-License-Identifier: MIT
pragma solidity 0.8.18; 

import "@openzeppelin/contracts@4.9.3/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

contract MyEnergyToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("EnergyToken", "ENG") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
