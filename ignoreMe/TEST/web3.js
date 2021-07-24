var Web3 = require("web3");

var web3 = new Web3('http://localhost:9545'); // your geth
var account = web3.eth.accounts.create();
console.log(account);

// retrive balance
web3.eth.getBalance(account.address, (err,result)=>{
    if(err) console.log(err);
    else console.log(result);
});
// web3.eth.getBalance('0xbbece2c25B5A4B3A4Fe15fBa6a5B8f701Dfa6836', (err,result)=>{
//     if(err) console.log(err);
//     else console.log(result);
// });

// Third account details:
// private key : 0x9b29d9ed3f5186aefd386ac206b8700cbdbf8009582a04867957d1153e92e3a1
// address : 0xbbece2c25B5A4B3A4Fe15fBa6a5B8f701Dfa6836