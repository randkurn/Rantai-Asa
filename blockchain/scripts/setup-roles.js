const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  const dep = JSON.parse(fs.readFileSync("deployments/80002.json", "utf8"));
  const oracleAddr = "0x8De886cda52b5Dfa1FD3F3a564b29B177B98C76D";

  const rep = await ethers.getContractAt("ReportRegistry", dep.ReportRegistry);
  const OFFICER_ROLE = await rep.OFFICER_ROLE();

  console.log("Granting OFFICER_ROLE on ReportRegistry to deployer & oracle");
  let tx = await rep.grantRole(OFFICER_ROLE, deployer.address);
  await tx.wait();
  tx = await rep.grantRole(OFFICER_ROLE, oracleAddr);
  await tx.wait();

  console.log("ALL ROLES ON-CHAIN SETUP COMPLETE!");
}

main().catch(console.error);
