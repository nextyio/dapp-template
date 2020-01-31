const SeigniorageData = require('./../build/contracts/Seigniorage.json')
const VolatileTokenData = require('./../build/contracts/VolatileToken.json')
const StableTokenData = require('./../build/contracts/StableToken.json')
const Web3 = require('web3');
const Tx = require('ethereumjs-tx')
var BigNumber = require('bignumber.js');

let args = process.argv
let network = args[2]
let type = args[3]
let amount = args[4]
let endPoint = network.includes('local') ? 'http://127.0.0.1:8545' : 'http://rpc.testnet.nexty.io:8545'
const networkId = 111111

const CONTRACTS =
  {
    'Seigniorage':
      {
        'abi': SeigniorageData.abi,
        'address': SeigniorageData.networks[networkId].address
      },
    'VolatileToken':
      {
        'abi': VolatileTokenData.abi,
        'address': VolatileTokenData.networks[networkId].address
      },
    'StableToken':
      {
        'abi': StableTokenData.abi,
        'address': StableTokenData.networks[networkId].address
      }
  }

var web3 = new Web3(new Web3.providers.HttpProvider(endPoint))
var VolatileToken = new web3.eth.Contract(CONTRACTS.VolatileToken.abi, CONTRACTS.VolatileToken.address)
var StableToken = new web3.eth.Contract(CONTRACTS.StableToken.abi, CONTRACTS.StableToken.address)
var Seigniorage = new web3.eth.Contract(CONTRACTS.Seigniorage.abi, CONTRACTS.Seigniorage.address)
var myAddress = '0x95e2fcBa1EB33dc4b8c6DCBfCC6352f0a253285d';
var privateKey = Buffer.from('a0cf475a29e527dcb1c35f66f1d78852b14d5f5109f75fa4b38fbe46db2022a5', 'hex')

var count
var myBalance

async function getNonce (_address) {
  return await web3.eth.getTransactionCount(_address)
}

async function absorb(nonce, _orderType, _targetSTB) {
  console.log('absorb', _orderType, _targetSTB)
  let contractAddress = Seigniorage._address
  let methods = Seigniorage.methods
  let toDeposit = 0
  let rawTransaction = {
    'from': myAddress,
    'gasPrice': web3.utils.toHex(0),
    'gasLimit': web3.utils.toHex(9999999),
    'to': contractAddress,
    'value': web3.utils.toHex(toDeposit),
    'data': methods.absorb(_orderType, _targetSTB).encodeABI(),
    'nonce': web3.utils.toHex(nonce)
  }

  console.log(rawTransaction)
  let transaction = new Tx(rawTransaction);
  // signing transaction with private key
  transaction.sign(privateKey)
  // sending transacton via web3 module
  await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex')) // .on('transactionHash', console.log)
}

async function doAbsorb() {
  let nonce = await getNonce(myAddress)
  await console.log('start with nonce = ', nonce)
  myBalance = await VolatileToken.methods.balanceOf(myAddress).call()
  await console.log('start with MegaNTY Amount = ', BigNumber(myBalance).toFixed(0)/1e24)
  myBalance = await StableToken.methods.balanceOf(myAddress).call()
  await console.log('start with nUSD Amount = ', BigNumber(myBalance).toFixed(0)/1e6)
  await absorb(nonce, type === 'inflate', amount * 1e6)
}

doAbsorb()
