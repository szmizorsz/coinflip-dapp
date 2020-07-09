import "./Ownable.sol";  
pragma solidity 0.5.12;

contract Coinflip is Ownable {

    uint public balance;

	event BetResult(address player, uint betAmount, bool betFlip, bool flipResult, uint payout, uint contractBalance);

    constructor() public payable{
        balance = msg.value;
    }

    function getBalance() public view returns(uint) {
    	return balance;
    }

    function withdrawAmount(uint amount) public onlyOwner {
       uint toTransfer = amount;
       balance = balance - amount;
       msg.sender.transfer(toTransfer);
   }

    function withdrawAll() public onlyOwner {
       uint toTransfer = balance;
       balance = 0;
       msg.sender.transfer(toTransfer);
   }

    // tails = true, heads = false
   function random() public view returns(bool) {
   	   return (now % 2) == 0;
   }

   function bet(bool betFlip) public payable {
   	   require(balance > 0);
   	   require(balance >= msg.value);
   	   bool flipResult = random();
 	   uint toTransfer;
   	   if(flipResult != betFlip) {  
   	   		balance += msg.value; 
   	   	} else {
   			balance -= msg.value; 
  			toTransfer = 2 * msg.value;
   	   		msg.sender.transfer(toTransfer);
   	   	}
   	   	emit BetResult(msg.sender, msg.value, betFlip, flipResult, toTransfer, balance);
   }

   function destroy() external onlyOwner {
        selfdestruct(owner);
   }   

}