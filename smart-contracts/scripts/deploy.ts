import { ethers } from 'hardhat';

function addressFromEnv(name: string, fallback?: string) {
  const value = process.env[name] || fallback;
  if (!value || !ethers.isAddress(value)) throw new Error(`${name} must be a valid address`);
  return value;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const owner = addressFromEnv('OWNER_ADDRESS', deployer.address);
  const guardian = addressFromEnv('GUARDIAN_ADDRESS');
  const rescueVault = addressFromEnv('RESCUE_VAULT_ADDRESS', owner);

  const network = await ethers.provider.getNetwork();
  const expectedChainId = Number(process.env.BOTCHAIN_CHAIN_ID || 0);
  if (expectedChainId && Number(network.chainId) !== expectedChainId) {
    throw new Error(`Connected to chain ${network.chainId}, expected ${expectedChainId}`);
  }

  const tokenGuard = await ethers.deployContract('TokenGuard');
  await tokenGuard.waitForDeployment();

  const factory = await ethers.deployContract('GuardFactory', [guardian, await tokenGuard.getAddress()]);
  await factory.waitForDeployment();

  console.log(JSON.stringify({
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    owner,
    guardian,
    rescueVault,
    tokenGuard: await tokenGuard.getAddress(),
    guardFactory: await factory.getAddress()
  }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
