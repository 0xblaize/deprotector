import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('GuardWallet', function () {
  async function deploy() {
    const [owner, guardian, recipient] = await ethers.getSigners();
    const tokenGuard = await ethers.deployContract('TokenGuard');
    await tokenGuard.waitForDeployment();
    const wallet = await ethers.deployContract('GuardWallet', [owner.address, guardian.address, await tokenGuard.getAddress(), recipient.address]);
    await wallet.waitForDeployment();
    return { owner, guardian, recipient, tokenGuard, wallet };
  }

  it('allows the owner to execute when unfrozen', async function () {
    const { owner, recipient, wallet } = await deploy();
    await owner.sendTransaction({ to: await wallet.getAddress(), value: ethers.parseEther('0.1') });
    await wallet.connect(owner).execute(recipient.address, ethers.parseEther('0.1'), '0x');
    expect(await ethers.provider.getBalance(await wallet.getAddress())).to.equal(0);
  });

  it('freezes owner execution and allows only the owner to unfreeze', async function () {
    const { owner, guardian, wallet } = await deploy();
    await wallet.connect(guardian).emergencyFreeze();
    await expect(wallet.connect(owner).execute(owner.address, 0, '0x')).to.be.revertedWith('GuardWallet: wallet is frozen');
    await expect(wallet.connect(guardian).unfreeze()).to.be.revertedWith('GuardWallet: caller is not the owner');
    await wallet.connect(owner).unfreeze();
    expect(await wallet.isFrozen()).to.equal(false);
  });

  it('sweeps native funds only to the configured vault while frozen', async function () {
    const { owner, guardian, recipient, wallet } = await deploy();
    await owner.sendTransaction({ to: await wallet.getAddress(), value: ethers.parseEther('1') });
    await wallet.connect(guardian).emergencyFreeze();
    await wallet.connect(guardian).emergencySweepToken(ethers.ZeroAddress, 0);
    expect(await ethers.provider.getBalance(await wallet.getAddress())).to.equal(0);
    expect(await ethers.provider.getBalance(recipient.address)).to.be.greaterThan(0);
  });

  it('rejects blacklisted approval spenders', async function () {
    const { owner, tokenGuard, wallet } = await deploy();
    const spender = ethers.Wallet.createRandom().address;
    await tokenGuard.setSpenderStatus(spender, true);
    const approvalData = ethers.concat(['0x095ea7b3', ethers.zeroPadValue(spender, 32), ethers.zeroPadValue('0x01', 32)]);
    await expect(wallet.connect(owner).execute(ethers.Wallet.createRandom().address, 0, approvalData)).to.be.revertedWith('GuardWallet: blacklisted spender');
  });
});
