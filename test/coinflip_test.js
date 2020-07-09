  
const Coinflip = artifacts.require("Coinflip");
const truffleAssert = require("truffle-assertions");
const BN = web3.utils.BN

contract("Coinflip", async function(accounts){
	let instance;

	beforeEach(async function() {
		instance = await Coinflip.new({value: 10000});
	});

    afterEach(async function () {
        await instance.destroy();
    });

	it("should have balance after creation", async function() {
		let balance = await instance.getBalance();
		assert(balance.toNumber() === 10000);
	});

	it("should evaluate the bet correctly", async function() {
		let contractInitialBalance = await instance.getBalance();
		let betFlip = true;
		let player = accounts[1];
		let betAmount = 10000;
		let result = await instance.bet(betFlip, {from: player, value: betAmount});
		truffleAssert.eventEmitted(result, 'BetResult');
		truffleAssert.eventEmitted(result, 'BetResult', (e) => {
					return e.player === player
                        && e.betAmount.toNumber() === betAmount
                        && e.betFlip === betFlip
                        && (((e.flipResult === betFlip) && (e.payout.toNumber() === 2*betAmount) && (e.contractBalance.toNumber() === contractInitialBalance.toNumber() - betAmount)) || 
                        	((e.flipResult !== betFlip) && (e.payout.toNumber() === 0) && (e.contractBalance.toNumber() === contractInitialBalance.toNumber() + betAmount)));
                }, 'event params incorrect');
	});

	it("should revert with higher bet than the contract balance", async function() {
		let contractInitialBalance = await instance.getBalance();
		let betFlip = true;
		let player = accounts[1];
		let betAmount = 20000;
		truffleAssert.reverts(instance.bet(betFlip, {from: player, value: betAmount}));
	});

	it("owner should be able to withdraw a given amount", async function() {
		let withdrawAmount = 5000;
		let owner = accounts[0];
		let initialBalance = await instance.getBalance();
		await instance.withdrawAmount(withdrawAmount, {from: owner});
		let newBalance = await instance.getBalance();
		assert(newBalance.toNumber() === initialBalance.toNumber() - withdrawAmount);
	});

	it("owner should be able to withdraw the whole balance", async function() {
		instance = await Coinflip.new({value: web3.utils.toWei("1", "ether")});
		let owner = accounts[0];
		let initialBalance = new BN(await instance.getBalance());
		let initialOwnerBalance = new BN(await web3.eth.getBalance(owner));
		await instance.withdrawAll({from: owner});
		let newBalance = new BN(await instance.getBalance());
		let newOwnerBalance = new BN(await web3.eth.getBalance(owner));
		assert(newBalance.isZero());
		assert(newOwnerBalance.gt(initialOwnerBalance));
	});


});

