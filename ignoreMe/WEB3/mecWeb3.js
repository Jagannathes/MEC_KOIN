
const Contract = require('web3-eth-contract');
const Web3 = require("web3");
const fs = require('fs');
require('dotenv').config();

/**********************************************************************************/
const providerUrl = process.env.providerUrl;
const contractAddress = process.env.contractAddress;
const ABIPath = 'MecKoinContractABI.json'
/**********************************************************************************/


const ABIArray = JSON.parse(fs.readFileSync(ABIPath,'utf8'));
const web3 = new Web3(providerUrl);
Contract.setProvider(providerUrl);
const contract = new Contract(ABIArray, contractAddress);




/*********************************************************************************
 *                            checkBalance
 * Parameters(address of which balance is needed)
 * Addresses must be string
 * Returns Promise
 *         Throws "CheckSum Failed" error if addressCheckSum is not valid
 *         Resolves with Balance if success
 *         Rejects with error if fails
 *********************************************************************************/
async function checkBalance(accountAddress) {
    if(!web3.utils.checkAddressChecksum(accountAddress)){
        console.log("CheckSum Failed:" + accountAddress);
        throw("CheckSum Failed");
    }
    try{   
        const balance = await contract.methods.balanceOf(accountAddress).call();
        return balance;
    }
    catch(err){
        console.log("Error in fetching Balance: " + err)
        return err;
    }
}


/*********************************************************************************
 *                            transfer
 * Parameters(FromAddress,PrivateKeyOfFromAddress, ToAddress , NoOfTokensToSend)
 * Addresses and private key must be strings
 * Returns Promise
 *         Throws "CheckSum Failed" error if addressCheckSum is not valid
 *         Resolves with transaction_hash if success
 *         Rejects with error if fails
 *********************************************************************************/
async function transfer(fromAddress,privateKeyFrom,toAddress,tokenCount){
    if(!web3.utils.checkAddressChecksum(fromAddress)){
        console.log("CheckSum Failed:" + fromAddress);
        throw("CheckSum Failed");
    }
    if(!web3.utils.checkAddressChecksum(toAddress)){
        console.log("CheckSum Failed:" + toAddress);
        throw("CheckSum Failed");
    }
    let gasLimit = await contract.methods.transfer(toAddress,tokenCount).estimateGas({"from":fromAddress});
    return promise = new Promise( (resolve,reject)=>{      
        try{
            
            //Documentation Link : https://web3js.readthedocs.io/en/v1.3.4/web3-eth-accounts.html#signtransaction
            var rawTx = {
                "from": fromAddress,
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": contractAddress,
                "value": "0x0",
                "data": contract.methods.transfer(toAddress,tokenCount).encodeABI(),
            };
            
            web3.eth.accounts.signTransaction(rawTx,privateKeyFrom,(err,result) =>{
                if(err){
                    console.log("Error during Signing : " + err);
                    reject(err);
                }
                else{
                    web3.eth.sendSignedTransaction(result.rawTransaction,(err,hash)=>{
                        if(err){
                            console.log("Error during sending signed Tx : " + err);
                            reject(err);
                        }
                        else{
                            console.log("*****************************")
                            console.log("Transaction Success!");
                            console.log("From: " + fromAddress);
                            console.log("To: " + toAddress);
                            console.log("Transaction Hash : " + hash);
                            console.log("*****************************")
                            resolve(hash);
                        }
                    })
                }
            } );
            
        }catch(err){
            console.log("Error in Transaction: " + err);
            reject(err);
        }
    });
}

module.exports = {checkBalance, transfer};


