pragma solidity >=0.4.22 <0.9.0;

// import "https://github.com/OpenZeppelin/zeppelin-solidity/contracts/token/ERC20/ERC20.sol"

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MecKoinContract is ERC20{

    constructor(uint256 _totalSupply) public ERC20("MecKoin", "MecKoin") {
        _mint(msg.sender,_totalSupply);
    }
     
}