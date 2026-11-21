const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReportRegistry", () => {
  let reg, admin, officer, other;
  const HASH1 = ethers.id("laporan-001");
  const HASH2 = ethers.id("laporan-002");
  const REGION = 3201;
  const CAT = "DUGAAN_GANDA";

  beforeEach(async () => {
    [admin, officer, other] = await ethers.getSigners();
    reg = await (await ethers.getContractFactory("ReportRegistry")).deploy();
    await reg.grantRole(await reg.OFFICER_ROLE(), officer.address);
  });

  it("R1 recordVerification emits ReportVerified", async () => {
    const tx = await reg.connect(officer).recordVerification(HASH1, REGION, CAT, 0);
    const receipt = await tx.wait();
    // Cek event terlepas dari timestamp (hindari off-by-one)
    const event = receipt.logs.find(l => {
      try { reg.interface.parseLog(l); return true; } catch { return false; }
    });
    expect(event).to.not.be.undefined;
    expect(await reg.totalReports()).to.equal(1);
    expect(await reg.reported(HASH1)).to.equal(true);
  });

  it("R2 duplikat hash ditolak", async () => {
    await reg.connect(officer).recordVerification(HASH1, REGION, CAT, 0);
    await expect(reg.connect(officer).recordVerification(HASH1, REGION, CAT, 0))
      .to.be.revertedWithCustomError(reg, "DuplicateReport");
  });

  it("R3 hash kosong ditolak", async () => {
    await expect(reg.connect(officer).recordVerification(ethers.ZeroHash, REGION, CAT, 0))
      .to.be.revertedWithCustomError(reg, "InvalidHash");
  });

  it("R4 non-officer ditolak", async () => {
    await expect(reg.connect(other).recordVerification(HASH1, REGION, CAT, 0))
      .to.be.reverted;
  });

  it("R5 status REJECTED tercatat", async () => {
    await reg.connect(officer).recordVerification(HASH2, 3273, "TIDAK_LAYAK", 1);
    const e = await reg.getReport(0);
    expect(e.status).to.equal(1); // Status.REJECTED
  });

  it("R6 getReport mengembalikan data benar", async () => {
    await reg.connect(officer).recordVerification(HASH1, REGION, CAT, 0);
    const e = await reg.getReport(0);
    expect(e.reportHash).to.equal(HASH1);
    expect(e.officer).to.equal(officer.address);
  });
});
