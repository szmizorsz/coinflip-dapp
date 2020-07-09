var web3 = new Web3(Web3.givenProvider);
var contractAddress = "0x3Fa413508b132D59531fb10601bbbD0928556cD6";
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
	    contractInstance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]});
	    console.log(contractInstance);
	    refreshContractBalanceDisplay();
    });
    $("#lets_play_button").click(bet);
    $("#withdraw_all_button").click(withdrawAll);
    $("#withdraw_amount_button").click(withdrawAmount);    
});

function bet(){
	var amount = $("#amount_input").val();
	var flip = ($('input[name="flip_input"]:checked').val() == "Head") ? true : false;

	var config = {
		value: amount,
		gas: 1000000
	}
	contractInstance.methods.bet(flip).send(config)
	.on("transactionHash", function(transactionHash){
		console.log(transactionHash);
	})
	.on("confirmation", function(confirmationNr){
		console.log(confirmationNr);
	})
	.on("receipt", function(receipt){
		receipt_handler(receipt);
		console.log(receipt);
		refreshContractBalanceDisplay();
	})
}

function receipt_handler(receipt) {
	if(receipt.events.BetResult.returnValues.betFlip === receipt.events.BetResult.returnValues.flipResult) {
		$("#result_output").text("Congrats, you won!");
	} else {
		$("#result_output").text("Sorry, you lost!");
	}
	$("#prize_output").text(receipt.events.BetResult.returnValues.payout);
	$("#contract_balance_output").text(receipt.events.BetResult.returnValues.contractBalance);
}

function withdrawAll() {
	var config = {
		gas: 1000000
	}
	contractInstance.methods.withdrawAll().send(config)
	.on("receipt", function(receipt){
		$("#result_output").text("");
		$("#prize_output").text("");
		refreshContractBalanceDisplay();
	})
}

function withdrawAmount() {
	var amount = $("#withdraw_amount_input").val();
	var config = {
		gas: 1000000
	}
	contractInstance.methods.withdrawAmount(amount).send(config)
	.on("receipt", function(receipt){
		$("#result_output").text("");
		$("#prize_output").text("");
		refreshContractBalanceDisplay();
	})
}

function refreshContractBalanceDisplay() {
	contractInstance.methods.getBalance().call().then(function(result) {
		$("#contract_balance_output").text(result);
	})
}

