const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [d] = await ethers.getSigners();
  const net = (await ethers.provider.getNetwork()).chainId.toString();

  console.log("Deploy ke chainId:", net, "deployer:", d.address);

  const reg = await (await ethers.getContractFactory("IdentityRegistry")).deploy(202601, 202612);
  await reg.waitForDeployment();
  console.log("IdentityRegistry:", await reg.getAddress());

  const aid = await (await ethers.getContractFactory("AidDisbursement")).deploy(await reg.getAddress(), 60);
  await aid.waitForDeployment();
  console.log("AidDisbursement:", await aid.getAddress());

  const report = await (await ethers.getContractFactory("ReportRegistry")).deploy();
  await report.waitForDeployment();
  console.log("ReportRegistry:", await report.getAddress());

  // Setup program default
  await (await reg.setProgram(1, true)).wait();

  const out = {
    chainId: net,
    deployer: d.address,
    IdentityRegistry: await reg.getAddress(),
    AidDisbursement: await aid.getAddress(),
    ReportRegistry: await report.getAddress()
  };

  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(`deployments/${net}.json`, JSON.stringify(out, null, 2));
  console.log("\nDeployment saved:", out);
  console.log("\nBerikutnya:");
  console.log("1. grantRole OFFICER_ROLE (wallet petugas) di IdentityRegistry, AidDisbursement, ReportRegistry");
  console.log("2. grantRole ORACLE_ROLE (akun backend) di AidDisbursement");
  console.log("3. Isi REGISTRY_ADDRESS, DISBURSE_ADDRESS, REPORT_REGISTRY_ADDRESS di .env backend");
  console.log("4. Verifikasi kontrak di https://amoy.polygonscan.com");
}

main().catch(e => { console.error(e); process.exit(1); });
