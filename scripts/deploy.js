const deploy = async () => {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contract with the account:", deployer.address);
  
    const SelloChaineCO2 = await ethers.getContractFactory("SelloChainedCO2");
    const deployed = await SelloChaineCO2.deploy();
  
    console.log("SelloChainedCO2 is deployed at:", deployed.address);
  };
  
deploy()
.then(() => process.exit(0))
.catch((error) => {
    console.log(error);
    process.exit(1);
});