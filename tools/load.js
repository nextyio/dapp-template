const VolatileTokenData = require('./../build/contracts/VolatileToken.json')
const StableTokenData = require('./../build/contracts/StableToken.json')
const SeigniorageData = require('./../build/contracts/Seigniorage.json')
const Web3 = require('web3');
const Tx = require('ethereumjs-tx')
const BN = require('bn.js')
const BigNumber = require('bignumber.js')
const crypto = require('crypto')

let args = process.argv
let network = args[2]
let spamType = args[3]
if (!spamType) spamType = 'both'
let noo = args[4]
if (!noo) noo = 30
let endPoint = network.includes('local') ? 'http://127.0.0.1:8545' : 'http://rpc.testnet.nexty.io:8545'
const networkId = 111111
const SeigniorageAddress    = '0x0000000000000000000000000000000000023456'
const VolatileTokenAddress  = '0x0000000000000000000000000000000000034567'
const StableTokenAddress    = '0x0000000000000000000000000000000000045678'
const ConsensusDeploy = process.env.CONDEP

const DECIMALS = {
  mnty: 24,
  nusd: 6
}

const UNITS =
{
  'MNTY': BigNumber(10).pow(DECIMALS.mnty),
  'NUSD': BigNumber(10).pow(DECIMALS.nusd)
}

const AMOUNT_MAX_DIGIT = 36;

const CONTRACTS =
  {
    'VolatileToken':
      {
        'abi': VolatileTokenData.abi,
        'address': ConsensusDeploy ? VolatileTokenAddress : VolatileTokenData.networks[networkId].address
      },
    'StableToken':
      {
        'abi': StableTokenData.abi,
        'address': ConsensusDeploy ? StableTokenAddress : StableTokenData.networks[networkId].address
      },
    'Seigniorage':
      {
        'abi': SeigniorageData.abi,
        'address': ConsensusDeploy ? SeigniorageAddress : SeigniorageData.networks[networkId].address
      }
  }

var web3 = new Web3(new Web3.providers.HttpProvider(endPoint))
var VolatileToken = new web3.eth.Contract(CONTRACTS.VolatileToken.abi, CONTRACTS.VolatileToken.address)
var StableToken = new web3.eth.Contract(CONTRACTS.StableToken.abi, CONTRACTS.StableToken.address)
var myAddress = '0xd638dc353687169d117df1933ba93fcc1ff42834';
var privateKey = Buffer.from('4c668fce6f03044f74ccd256b837a485a809562a55947abdfcb934d8cf8fe631', 'hex')

var myBalance

async function getNonce (_address) {
  return await web3.eth.getTransactionCount(_address)
}

async function trade (nonce, orderType) {
  console.log('new order', orderType)
  const haveToken = orderType === 'sell' ? VolatileToken : StableToken
  const wantToken = orderType !== 'sell' ? VolatileToken : StableToken

  // adjust _wantAmount to the demand/supply
  //let supplyHave = await haveToken.methods.totalSupply().call();
  const balanceHave = new BN(await haveToken.methods.balanceOf(myAddress).call());
  const supplyHave = new BN(await haveToken.methods.totalSupply().call());
  const supplyWant = new BN(await wantToken.methods.totalSupply().call());
  console.log('balanceHave', balanceHave.toString(), 'supplyHave', supplyHave.toString(), 'supplyWant', supplyWant.toString());
  if (balanceHave.clone().shln(1).lt(supplyHave)) {
    console.log('have too little token, don\'t order');
    return
  }
  let have = balanceHave.clone().shrn(6);
  let want = supplyWant.clone().shrn(6);

  // wiggle 16%
  const wiggle = new BN(Math.floor(Math.random() * 128)).mul(want).shrn(13);
  if (orderType === 'sell') {
    want.add(wiggle)
  } else {
    want.sub(wiggle)
  }

  console.log('have', have.toString(), 'want', want.toString(), 'wiggle', wiggle.toString());

  //cap(have, want, 128);
  const bitLength = 128
  if (have.bitLength() > bitLength || want.bitLength() > bitLength) {
    const toShift = Math.max(have.bitLength(), want.bitLength()) - bitLength;
    console.log("toShift = ", toShift)
    have = have.shrn(toShift);
    want = want.shrn(toShift);
  
    if (have.isZero()) {
      have = new BN(1);
    }
    if (want.isZero()) {
      want = new BN(1);
    }
    console.log('capped have', have.toString(), 'capped want', want.toString());
  }

  const index = '0x' + crypto.randomBytes(32).toString('hex');

  let rawTransaction = {
    'from': myAddress,
    'gasPrice': web3.utils.toHex(0),
    'gasLimit': web3.utils.toHex(9999999),
    'to': haveToken._address,
    'value': web3.utils.toHex(0),
    'data': haveToken.methods.trade(index, have.toString(10), want.toString(10), [0]).encodeABI(),
    'nonce': web3.utils.toHex(nonce)
  }
  //console.log(rawTransaction)
  let transaction = new Tx(rawTransaction);
  // signing transaction with private key
  transaction.sign(privateKey)
  // sending transacton via web3 module
  await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex')) // .on('transactionHash', console.log)
}

async function randomOrder (nonce) {
  let orderType
  if (spamType.toLowerCase() === 'buy') {
    orderType = 'buy'
  } else if (spamType.toLowerCase() === 'sell') {
    orderType = 'sell'
  } else {
    orderType = (Math.random() < 0.5) ? 'sell' : 'buy'
  }
  await trade(nonce, orderType)
}

async function load () {
  let count = await getNonce(myAddress)
  await console.log('start with nonce = ', count)
  let methods = VolatileToken.methods
  myBalance = await methods.balanceOf(myAddress).call()
  await console.log('start with WNTY Amount = ', BigNumber(myBalance).toFixed(0))
  for (let i = 0; i < noo; i++) {
    randomOrder(count + i)
  }
}

load()