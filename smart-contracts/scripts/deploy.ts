import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  const owner = process.env.OWNER_ADDRESS || deployer.address;
  const guardian = process.env.GUARDIAN_ADDRESS;
  if (!guardian) throw new Error('GUARDIAN_ADDRESS is required');

  const tokenGuard = await ethers.deployContract('TokenGuard');
  await tokenGuard.waitForDeployment();

  const wallet = await ethers.deployContract('GuardWallet', [owner, guardian]);
  await wallet.waitForDeployment();
  await wallet.setTokenGuard(await tokenGuard.getAddress());

  console.log(JSON.stringify({
    deployer: deployer.address,
    tokenGuard: await tokenGuard.getAddress(),
    guardWallet: await wallet.getAddress()
  }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
