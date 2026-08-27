import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('GuardWallet Smart Account', function () {
    let owner: any;
    let guardian: any;
    let victim: any;
    let safeVault: any;
    let guardWallet: any;

    beforeEach(async function () {
        [owner, guardian, victim, safeVault] = await ethers.getSigners();

        const GuardWalletFactory = await ethers.getContractFactory('GuardWallet');
        guardWallet = await GuardWalletFactory.deploy(owner.address, guardian.address);
        await guardWallet.waitForDeployment();
    });

    it('Should allow owner to execute transactions when not frozen', async function () {
        const tx = await guardWallet.connect(owner).execute(victim.address, ethers.parseEther('0.1'), '0x', {
            value: ethers.parseEther('0.1')
        });
        await tx.wait();
        expect(await ethers.provider.getBalance(guardWallet.target)).to.equal(0);
    });

    it('Should allow guardian to trigger emergency freeze', async function () {
        await guardWallet.connect(guardian).emergencyFreeze();
        expect(await guardWallet.isFrozen()).to.be.true;

        // Owner execution must fail when contract is frozen
        await expect(
            guardWallet.connect(owner).execute(victim.address, 0, '0x')
        ).to.be.revertedWith('GuardWallet: contract is frozen due to high threat state');
    });

    it('Should allow guardian to sweep native funds to safe vault during attack', async function () {
        // Send ETH to GuardWallet
        await owner.sendTransaction({
            to: guardWallet.target,
            value: ethers.parseEther('1.0')
        });

        // Guardian sweeps funds to vault
        await guardWallet.connect(guardian).emergencySweepToken(ethers.ZeroAddress, safeVault.address, ethers.parseEther('1.0'));
        expect(await ethers.provider.getBalance(guardWallet.target)).to.equal(0);
    });
});
