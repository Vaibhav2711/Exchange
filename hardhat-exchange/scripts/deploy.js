// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers} = require("hardhat");
require("dotenv").config({path:".env"});
const {CRYPTO_MINION_TOKEN_CONTRACT_ADDRESS} = require("../constants");

async function main() {
  const cryptoMinionTokenAddress = CRYPTO_MINION_TOKEN_CONTRACT_ADDRESS;
  const exchangeContract = await ethers.getContractFactory("Exchange");
  const deployedExchangeContract = await exchangeContract.deploy(cryptoMinionTokenAddress);
  await deployedExchangeContract.deployed();
  console.log("Exchange Contract Address:",deployedExchangeContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
