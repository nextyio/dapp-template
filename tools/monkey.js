const fs = require('fs');
const VolatileTokenData = require('./../build/contracts/VolatileToken.json')
const StableTokenData = require('./../build/contracts/StableToken.json')
const SeigniorageData = require('./../build/contracts/Seigniorage.json')
const Web3 = require('web3');
const Tx = require('ethereumjs-tx')
const BN = require('bn.js')
//var BigNumber = require('bignumber.js')

const args = process.argv
const network = args[2]
// let spamType = args[3]
// if (!spamType) spamType = 'both'
// let noo = args[4]
// if (!noo) noo = 30
let endPoint = network.includes('local') ? 'http://127.0.0.1:8545' : 'http://rpc.testnet.nexty.io:8545'
const NetworkID = 111111
const SeigniorageAddress    = '0x0000000000000000000000000000000000023456'
const VolatileTokenAddress  = '0x0000000000000000000000000000000000034567'
const StableTokenAddress    = '0x0000000000000000000000000000000000045678'
const ConsensusDeploy = process.env.CONDEP

const DECIMALS = {
  mnty: 24,
  nusd: 6,
  nty: 18,
}

//const AMOUNT_MAX_DIGIT = 36;

const CONTRACTS = {
  'VolatileToken': {
    'abi': VolatileTokenData.abi,
    'address': ConsensusDeploy ? VolatileTokenAddress : VolatileTokenData.networks[NetworkID].address
  },
  'StableToken': {
    'abi': StableTokenData.abi,
    'address': ConsensusDeploy ? StableTokenAddress : StableTokenData.networks[NetworkID].address
  },
  'Seigniorage': {
    'abi': SeigniorageData.abi,
    'address': ConsensusDeploy ? SeigniorageAddress : SeigniorageData.networks[NetworkID].address
  }
}

const web3 = new Web3(new Web3.providers.HttpProvider(endPoint))
const VolatileToken = new web3.eth.Contract(CONTRACTS.VolatileToken.abi, CONTRACTS.VolatileToken.address)
const StableToken = new web3.eth.Contract(CONTRACTS.StableToken.abi, CONTRACTS.StableToken.address)
const Seigniorage = new web3.eth.Contract(CONTRACTS.Seigniorage.abi, CONTRACTS.Seigniorage.address)

// use Truffle address as prefund
let PREFUND = {
  address: '71e2ecb267a79fa7d026559aba3a10ee569f4176',
  key: Buffer.from('0f2e668a2374c2e19e55520ce65a5f95b3597fd08013fd35bc2de23a917d2ba0', 'hex'),
};

let FAUCET = {
  address: '0x12342b5E81bdFbBED8517aeCbCb1Eb114c3d215A',
  key: Buffer.from('6a041b89e85565c9f73ae5d1c118948a871e4e26c765959a7c672301bbec1bc6', 'hex'),
};
sendTx(PREFUND, FAUCET.address, 613 + "0".repeat(DECIMALS.mnty)).catch(err => {
  console.error(err);
});

// load and convert the ACC to Buffer
let ACC = JSON.parse(fs.readFileSync("./keypairs.json"))
for (const address in ACC) {
  ACC[address]={
    address: address,
    key: Buffer.from(ACC[address], 'hex'),
  };
}

main();
async function main() {
  FAUCET.nonce = web3.utils.toDecimal(await web3.eth.getTransactionCount(FAUCET.address))
  for (let c = 0; true || c < 100; c++) {
    let pCount = await Seigniorage.methods.getProposalCount().call();
    for (let i = 0; i < pCount; i++) {
      Seigniorage.methods.getProposal(i).call().then(res => {
        let abiVoteUp = Seigniorage.methods.vote(res.maker, true).encodeABI();
        let abiVoteDown = Seigniorage.methods.vote(res.maker, false).encodeABI();
        for (let i = 0; i < 30; i++) {
          let a = randomAccount();
          web3.eth.getBalance(a.address).then(async (aBL) => {
            if (aBL == 0) {
              await sendTx(FAUCET, a.address, ((Math.random()*9) << 0) + "0".repeat(DECIMALS.mnty-6)).catch(err => {
                console.error(err);
              });
            }
            console.log(a.address, 'vote for', res.maker);
            sendTx(a, Seigniorage._address, 0, Math.random() < 0.5 ? abiVoteUp : abiVoteDown)
              .catch(err => {
                console.error(err);
              });
          });
        }
      }).catch(err => {
        console.error(err);
      });
    }
    //batch loop
    // for (let i = 0; i < 100; i++) {
    //   let a = randomAccount();
    //   web3.eth.getBalance(a.address).then(aBL => {
    //     if (aBL == 0) {
    //       sendTx(FAUCET, a.address, ((Math.random()*9) << 0) + "0".repeat(DECIMALS.mnty-6)).catch(err => {
    //         console.error(err);
    //       });
    //     } else {
    //       sendTx(a, randomAccount().address, web3.utils.toBN(aBL).shrn((Math.random()*4) << 0)).catch(err => {
    //         console.error(err);
    //       });
    //     }
    //   });
    // }
    await sleep((Math.random()*2000) << 0);
  }
  //console.log(ACC);
}

function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(resolve,ms);
  })
}

async function sendTx(from, toAddress, amount, data) {
  let amountHex = web3.utils.isBigNumber(amount) ?
    amount.toHex() : web3.utils.toHex(amount);
  if (!from.hasOwnProperty('nonce')) {
    from.nonce = web3.utils.toDecimal(await web3.eth.getTransactionCount(from.address));
    console.log(from.address, "has nonce", from.nonce);
  }
  let rawTransaction = {
    from: from.address,
    to: toAddress,
    value: amountHex,
    gasPrice: web3.utils.toHex(0),
    gasLimit: web3.utils.toHex(999999),
    nonce: web3.utils.toHex(from.nonce++),
  }
  if (data) {
    console.log('data =', data);
    rawTransaction.data = data;
  }
  let tx = new Tx(rawTransaction);
  tx.sign(from.key);
  return web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'));
}

function randomAccount() {
  const adrs = Object.keys(ACC);
  const adr = adrs[(adrs.length * Math.random()) << 0];
  return ACC[adr];
}
