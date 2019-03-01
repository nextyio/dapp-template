var Migrations = artifacts.require("./Migrations.sol");
var ReadWrite = artifacts.require("./ReadWrite.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(ReadWrite);
};
