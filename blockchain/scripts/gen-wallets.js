const { ethers } = require("ethers");

console.log("=== MEMBUAT WALLET TESTNET (SIMULASI / DEMO) ===");

for (let i = 1; i <= 2; i++) {
  const role = i === 1 ? "DEPLOYER" : "ORACLE";
  const wallet = ethers.Wallet.createRandom();
  console.log("\n------------------------------------------------");
  console.log("PERAN       : " + role);
  console.log("Address     : " + wallet.address);
  console.log("Private Key : " + wallet.privateKey);
  if (i === 1) {
    console.log("-> Gunakan Address ini untuk request faucet MATIC di faucet.polygon.technology");
    console.log("-> Salin Private Key ke PRIVATE_KEY_DEPLOYER di .env");
  } else {
    console.log("-> Salin Private Key ke PRIVATE_KEY_ORACLE di .env");
  }
}
console.log("------------------------------------------------\n");
