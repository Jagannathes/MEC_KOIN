let {checkBalance, transfer} = require('./mecWeb3.js');


// Code inside the calling code
// Change according to needs

async function getBalance(accountAddress) {
    try{
        const balance = await checkBalance(accountAddress);
        console.log("Balance: " + balance);
    }
    catch(err){
        console.log(err);
    }
}
//call with valid address
// getBalance('address');



async function tokenTransfer(fromAccount, privateFrom, toAccount, tokenCount){
    try{
        result = await transfer(fromAccount, privateFrom, toAccount, tokenCount);
        console.log("Result:"+result);
    }catch(err){
        console.log("ErrorTrans:" + err);
    }
}

//call with valid details
// tokenTransfer(senderAccount,'senderPrivate','recieverAddress', no_of_tokens);
