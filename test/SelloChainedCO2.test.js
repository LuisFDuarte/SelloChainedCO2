const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SelloChainedCO2 Contract", () => {
  const setup = async () => {
    // obtiene el valor de quien despliega el contrato
    const [owner, otherAccount] = await ethers.getSigners();
    // declara el contrato
    const SelloContract = await ethers.getContractFactory("SelloChainedCO2");
    // despliega el contrato
    const deployed = await SelloContract.deploy();

    return {
      owner,
      deployed,
      otherAccount
    };
  };

  describe("Deployment", () => {
    it("Deploy contract successful", async () => {

      const { deployed } = await setup();

      const name = await deployed.name();
      expect(name).to.equal("SelloChainedCO2");
    });
  });

  describe("Minting", () => {
    it("Any user can mint", async () => {
      const { deployed, otherAccount } = await setup();
      const uri = "uri1";

      await deployed.connect(otherAccount).mint(uri);
      const ownerOfMinted = await deployed.ownerOf(1);
      const metadata = await deployed.tokenURI(1);

      expect(metadata).to.equal(uri)
      expect(ownerOfMinted).to.equal(otherAccount.address);
    });

    it("Metadata updates", async () => {
      const { deployed, otherAccount } = await setup();
      const uri1 = "uri1";
      const uri2 = "uri2";

      await deployed.connect(otherAccount).mint(uri1);
      await deployed.connect(otherAccount).mint(uri2);
      const metadata = await deployed.tokenURI(1);

      expect(metadata).to.equal(uri2)
      await expect(deployed.ownerOf(2)).to.be.revertedWith(
        "ERC721: invalid token ID"
      )
    });
  });

  describe("Status of token", () => {
    it("Status default when creating token", async () => {
      const { owner, deployed } = await setup();
      const uri = "uri1";

      await deployed.mint(uri);
      const status = await deployed.getStatus(owner.address);
      expect(status.status).to.equal("created");
    });

    it("Approve and reject not allowed to default role", async () => {
      const { deployed, otherAccount } = await setup();
      const role = "0x22b98cc76d8a21444f7020c48b59e24591c5274f5ec61b6d4d6f58f236e02119";
      await deployed.connect(otherAccount).mint("uri1");
      await expect(deployed.connect(otherAccount).approveNFT(otherAccount.address)).to.be.revertedWith(
        `AccessControl: account ${otherAccount.address.toLowerCase()} is missing role ${role}`
      )
      await expect(deployed.connect(otherAccount).rejectNFT(otherAccount.address)).to.be.revertedWith(
        `AccessControl: account ${otherAccount.address.toLowerCase()} is missing role ${role}`
      )
    });

    it("Status approved", async () => {
      const { deployed, otherAccount } = await setup();
      const uri = "uri1";

      await deployed.connect(otherAccount).mint(uri);
      await deployed.approveNFT(otherAccount.address);
      const status = await deployed.getStatus(otherAccount.address);
      expect(status.status).to.equal("approved");
    });

    it("Status rejected", async () => {
      const { deployed, otherAccount } = await setup();
      const uri = "uri1";

      await deployed.connect(otherAccount).mint(uri);
      await deployed.rejectNFT(otherAccount.address);
      const status = await deployed.getStatus(otherAccount.address);
      expect(status.status).to.equal("rejected");
    });

    it("Status pending", async () => {
      const { deployed, otherAccount } = await setup();
      const uri = "uri1";

      await deployed.connect(otherAccount).mint(uri);
      await deployed.connect(otherAccount).requestApproval();
      const status = await deployed.getStatus(otherAccount.address);
      expect(status.status).to.equal("pending");
    });

  })

  describe('Modifiers', () => {
    it("Check tokend exists", async () => {
      const { owner, deployed, otherAccount } = await setup();
      const uri = "uri1";

      await expect(deployed.requestApproval()).to.be.revertedWith("User doesn't have a token")
      await deployed.connect(otherAccount).mint(uri);
      await expect(deployed.rejectNFT(owner.address)).to.be.revertedWith("User doesn't have a token")
    })
  })

  describe('Access', () => {
    it("Owner has access to evaluate status", async () => {
      const { deployed } = await setup();

      const isReviewer = await deployed.isReviewer();
      expect(isReviewer).to.equal(true);
    })

    it("User doesn't have access to evaluate status", async () => {
      const { deployed, otherAccount } = await setup();

      const isReviewer = await deployed.connect(otherAccount).isReviewer();
      expect(isReviewer).to.equal(false);
    })

    it("Owner can give access to user", async () => {
      const { deployed, otherAccount } = await setup();
    
      let isReviewer = await deployed.connect(otherAccount).isReviewer();
      expect(isReviewer).to.equal(false);

      await deployed.grantReviewerAccess(otherAccount.address);
      isReviewer = await deployed.connect(otherAccount).isReviewer();
      expect(isReviewer).to.equal(true);
    })
  })

});