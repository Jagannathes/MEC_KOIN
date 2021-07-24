const MecKoinContract = artifacts.require("./MecKoinContract.sol");

module.exports = function (deployer) {
  deployer.deploy(MecKoinContract, 1000000);
};