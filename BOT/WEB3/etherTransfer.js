const Web3 = require("web3");
const EthereumTx = require('ethereumjs-tx').Transaction;
const axios = require('axios');
const ethNetwork = process.env.providerUrl;
const web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));
require('dotenv').config();

async function transferFund(sendersData, recieverData, amountToSend) {
    return new Promise(async (resolve, reject) => {
        var nonce = await web3.eth.getTransactionCount(sendersData.address);
        web3.eth.getBalance(sendersData.address, async (err, result) => {
            if (err) {
              console.log(err)
                return reject(false);
            }
            let balance = web3.utils.fromWei(result, "ether");
            console.log(balance + " ETH");
            if(balance < amountToSend) {
                console.log('insufficient funds');
                return reject(false);
            }
   
            let gasPrices = await getCurrentGasPrices();
            let details = {
                "to": recieverData.address,
                "value": web3.utils.toHex(web3.utils.toWei(amountToSend.toString(), 'ether')),
                "gas": 21000,
                "gasPrice": gasPrices.low * 1000000000,
                "nonce": nonce,
                "chainId": 4 // EIP 155 chainId - mainnet: 1, rinkeby: 4
            };
           
            const transaction = new EthereumTx(details, {chain: 'rinkeby'});
           let privateKey = sendersData.privateKey;
            let privKey = Buffer.from(privateKey,'hex');
            transaction.sign(privKey );
           
            const serializedTransaction = transaction.serialize();
           
            web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'), (err, id) => {
                if(err) {
                    console.log(err);
                    return reject(false);
                }
                const url = `https://rinkeby.etherscan.io/tx/${id}`;
                console.log("Ether transaction was successful \n visit this url for transaction details:"+ url);
                resolve({id: id, link: url});
            });
        });
    });
}


async function getCurrentGasPrices() {
    let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
    let prices = {
      low: response.data.safeLow / 10,
      medium: response.data.average / 10,
      high: response.data.fast / 10
    };
    return prices;
}

async function getBalance(address) {
    return new Promise((resolve, reject) => {
        web3.eth.getBalance(address, async (err, result) => {
            if(err) {
                return reject(err);
            }
            resolve(web3.utils.fromWei(result, "ether"));
        });
    });
}
// add must be string
//NOTE: eth should not be greater than 0.1 or else there wont be any ethers left in the parent account to transfer
async function transfer(add,eth){
 let t = await transferFund({address: process.env.ethAddress  ,  privateKey: process.env.ethPrivate},{address: add }, eth)
 if(t) return false;
 else return true;
}
module.exports = { transfer , getCurrentGasPrices, getBalance};