const VolatileTokenData = require('./../build/contracts/VolatileToken.json')
const StableTokenData = require('./../build/contracts/StableToken.json')
const SeigniorageData = require('./../build/contracts/Seigniorage.json')
const Web3 = require('web3');
const Tx = require('ethereumjs-tx')
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

let seed = 1

async function cutString (s) {
  if (!s) return s
  if (s.length < 20) return s
  var first5 = s.substring(0, 5).toLowerCase()
  var last3 = s.slice(-3)
  return first5 + '...' + last3
}

async function weiToMNTY (wei) {
  return await (Number(web3.utils.fromWei(wei.toString())) / 1000000).toFixed(4)
}

const DECIMALS = {
  mnty: 24,
  nusd: 6
}

const CONTRACTS =
  {
    'VolatileToken':
      {
        'abi': VolatileTokenData.abi,
        'address': VolatileTokenData.networks[networkId].address
      },
    'StableToken':
      {
        'abi': StableTokenData.abi,
        'address': StableTokenData.networks[networkId].address
      },
    'Seigniorage':
      {
        'abi': SeigniorageData.abi,
        'address': SeigniorageData.networks[networkId].address
      }
  }

const UNITS =
  {
    'MNTY': BigNumber(10).pow(24),
    'NUSD': BigNumber(10).pow(6)
  }

  const BOUNDS =
  {
    'sell':
      {
        // WNTY Amount
        'Amount': {
          'Min': BigNumber(0).multipliedBy(UNITS.MNTY),
          'Max': BigNumber(9).multipliedBy(UNITS.MNTY)
        },
        // NUSD / 1 WNTY
        'Price': {
          'Min': BigNumber(0.9).multipliedBy(UNITS.NUSD).dividedBy(UNITS.MNTY),
          'Max': BigNumber(1.5).multipliedBy(UNITS.NUSD).dividedBy(UNITS.MNTY)
        }
      },
    'buy':
      {
        // WNTY Amount
        'Amount': {
          'Min': BigNumber(0).multipliedBy(UNITS.MNTY),
          'Max': BigNumber(9).multipliedBy(UNITS.MNTY)
        },
        // NUSD / 1 WNTY
        'Price': {
          'Min': BigNumber(0.5).multipliedBy(UNITS.NUSD).dividedBy(UNITS.MNTY),
          'Max': BigNumber(1.1).multipliedBy(UNITS.NUSD).dividedBy(UNITS.MNTY)
        }
      }
  }

var web3 = new Web3(new Web3.providers.HttpProvider(endPoint))
var VolatileToken = new web3.eth.Contract(CONTRACTS.VolatileToken.abi, CONTRACTS.VolatileToken.address)
var StableToken = new web3.eth.Contract(CONTRACTS.StableToken.abi, CONTRACTS.StableToken.address)
var Seigniorage = new web3.eth.Contract(CONTRACTS.Seigniorage.abi, CONTRACTS.Seigniorage.address)
var myAddress = '0x95e2fcBa1EB33dc4b8c6DCBfCC6352f0a253285d';
var privateKey = Buffer.from('a0cf475a29e527dcb1c35f66f1d78852b14d5f5109f75fa4b38fbe46db2022a5', 'hex')

var myBalance

async function getNonce (_address) {
  return await web3.eth.getTransactionCount(_address)
}

async function trade(nonce, _orderType, _haveAmount, _wantAmount) {
  console.log('new order', _orderType, _haveAmount, _wantAmount)
  let contractAddress = _orderType === 'sell' ? VolatileToken._address : StableToken._address
  let methods = _orderType === 'sell' ? VolatileToken.methods : StableToken.methods
  let toDeposit
  toDeposit = 0
  if (_orderType === 'sell') {
    toDeposit = BigNumber(myBalance).isGreaterThan(BigNumber(_haveAmount)) ? 0 : BigNumber(_haveAmount).minus(BigNumber(myBalance))
    toDeposit = new BigNumber(toDeposit).toFixed(0)
  }
  if (BigNumber(toDeposit).isGreaterThan(0)) myBalance = 0
  const index = '0x' + crypto.randomBytes(32).toString('hex');
  console.log('current balance xxx', myBalance, 'toDeposit', toDeposit, 'index', index)
  let rawTransaction = {
    'from': myAddress,
    'gasPrice': web3.utils.toHex(0),
    'gasLimit': web3.utils.toHex(780000),
    'to': contractAddress,
    'value': web3.utils.toHex(toDeposit),
    'data': methods.trade(index, _haveAmount, _wantAmount, [0]).encodeABI(),
    'nonce': web3.utils.toHex(nonce)
  }
  console.log(rawTransaction)
  let transaction = new Tx(rawTransaction);
  // signing transaction with private key
  transaction.sign(privateKey)
  // sending transacton via web3 module
  await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex')) // .on('transactionHash', console.log)
}

function sinRandom () {
  var x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// return random integer number in range [MIN, MAX]
function randomGen (_min, _max) {
  let zoom = new BigNumber(10).pow(18)
  let min = new BigNumber(_min).multipliedBy(zoom)
  let max = new BigNumber(_max).multipliedBy(zoom)
  let range = new BigNumber(max).minus(BigNumber(min))
  let random = new BigNumber(sinRandom()).multipliedBy(range)
  let res = ((BigNumber(min).plus(random)).dividedBy(zoom))
  return res
}

function getZoom (_value) {
  let parts = _value.toString().split('.')
  if (parts.length < 2) return 1
  return 10 ** (parts[1].length)
}

function getMaxZoom (a, b) {
  return a > b ? a : b
}

function createRandomOrderByType (_orderType) {
  let minPrice = BOUNDS[_orderType].Price.Min
  let maxPrice = BOUNDS[_orderType].Price.Max
  console.log('minPrice', minPrice)
  console.log('maxPrice', maxPrice)
  let price = randomGen(maxPrice, minPrice)
  console.log('price', price)
  let minAmount = BOUNDS[_orderType].Amount.Min
  let maxAmount = BOUNDS[_orderType].Amount.Max
  let haveAmount
  let wantAmount
  if (_orderType === 'sell') {
    haveAmount = new BigNumber(randomGen(maxAmount, minAmount)).toFixed(0)
    wantAmount = new BigNumber(haveAmount).multipliedBy(BigNumber(price)).toFixed(0)
  } else {
    wantAmount = new BigNumber(randomGen(maxAmount, minAmount)).toFixed(0)
    haveAmount = new BigNumber(wantAmount).multipliedBy(BigNumber(price)).toFixed(0)
  }
  let order = {
    'orderType': _orderType,
    'haveAmount': haveAmount,
    'wantAmount': wantAmount
  }
  return order
}

function createRandomOrder () {
  let _seed = randomGen(1, 0)
  let _orderType = BigNumber(_seed).isGreaterThan(BigNumber(0.5)) ? 'sell' : 'buy'
  if (spamType.toLowerCase() === 'buy') _orderType = 'buy'
  if (spamType.toLowerCase() === 'sell') _orderType = 'sell'
  return createRandomOrderByType(_orderType)
}

async function randomOrder (nonce) {
  let order = createRandomOrder()
  await trade(nonce, order.orderType, order.haveAmount, order.wantAmount)
}

async function getOrder(_orderType, _id) {
  // const store = this.store.getState()
  let methods = Seigniorage.methods
  let res = await methods.getOrder(_orderType, _id).call()
  let weiMNTY = _orderType ? BigNumber(await res[2]) : BigNumber(await res[1])
  weiMNTY = weiMNTY.toFixed(0)
  // console.log('weiMNTY', weiMNTY)
  let weiNUSD = _orderType ? BigNumber(await res[1]) : BigNumber(await res[2])
  weiNUSD = weiNUSD.toFixed(0)
  let amount = weiToMNTY(await weiMNTY)
  // let price = NUSDs / 1 MNTY = (weiNUSD / 1e18) / (weiMNTY / 1e24) = 1e6 * weiNUSD / weiMNTY
  let wPrice = BigNumber(await weiNUSD).multipliedBy(BigNumber(10).pow(DECIMALS.mnty)).div(await weiMNTY).div(BigNumber(10).pow(DECIMALS.nusd)) // weiNUSD / 1 MNTY
  // let expo = BigNumber(10).pow(DECIMALS.nusd)
  // let _before = BigNumber(wPrice).div(expo)
  // let _after = BigNumber(wPrice).mod(expo)
  // let price = _before.toString() + '.' + _after.toString()
  let price = wPrice.toFixed(10)
  let order = await {
      'id': _id,
      'maker': cutString(res[0]),
      'amount': amount,
      'price' : price,
      'haveAmount': res[1],
      'wantAmount': res[2],
      'prev': res[3],
      'next': res[4]}
  return await order
}

async function loadOrders(_orderType) {
  //const seigniorageRedux = this.store.getRedux('seigniorage')
  let orders = []
  let byteZero = '0x0000000000000000000000000000000000000000000000000000000000000000'
  let _id = byteZero
  let order = await getOrder(_orderType, _id)
  let prev = await order.prev
  let loop = 10
  while ((await prev !== byteZero)) {
      // await console.log('orderId', _id, 'prev', prev)
      _id = await prev
      order = await getOrder(_orderType, _id)
      //await this.addOrderToRedux(_orderType, order)
      await orders.push(order)
      prev = await order.prev
      await loop--
  }
  //await console.log('order' + _orderType ? 'Buy' : 'Sell', orders)
  if (_orderType) orders = await orders.reverse()
  console.log(await _orderType ? 'Buy' : 'Sell')
  console.log('length ', orders.length)
  //orders.push(orders[0])
  //let sortedOrders = await orders.sort((a, b) => (Number(a.price) > Number(b.price)) ? 1 : ((Number(b.price) > Number(a.price)) ? -1 : 0))
  // console.log('order 0', orders[0])
  // console.log('order 1', orders[1])
  for (let i = 0; i < orders.length - 1; i++) {
    if (Number(orders[i].price) < Number(orders[i + 1].price)) {
      console.log('ERROR at ', i)
      console.log(orders[i - 1])
      console.log(orders[i])
      console.log(orders[i + 1])
      return false
    }
  }
  console.log('PAST')
  return true
  // if ((await orders) !== (await sortedOrders)) {
  //   await console.log('ERROR')
  // } else {
  //   await console.log('CORRECT')
  // }
  // if (_orderType) {
  //     await this.dispatch(seigniorageRedux.actions.orders_update({'true': orders.reverse()}))
  // } else {
  //     await this.dispatch(seigniorageRedux.actions.orders_update({'false': orders}))
  // }
}

async function spam () {
  let count = await getNonce(myAddress)
  await console.log('start with nonce = ', count)
  let methods = VolatileToken.methods
  myBalance = await methods.balanceOf(myAddress).call()
  await console.log('start with WNTY Amount = ', BigNumber(myBalance).toFixed(0))
  for (let i = 0; i < noo; i++) {
    randomOrder(count + i)
    // let test = await loadOrders(false)
    // if (!test) return
    // test = await loadOrders(true)
    // if (!test) return
  }
  let test = await loadOrders(false)
  if (!test) return
  test = await loadOrders(true)
  if (!test) return
}

seed = 6688
spam()
//console.log(sinRandom())
// ERROR CASE
// new order Buy 90955684 88306489700594284400000000
// { id:
//   '0x22ceefdd9f2865d3fbf02cc67f592cd59f978879f152e0fed45eb3a7ca214a02',
//  maker: Promise { '0x95e...85d' },
//  amount: Promise { '88.3065' },
//  price: '1.0299999956',
//  haveAmount: '90955684',
//  wantAmount: '88306489700594284400000000',
//  prev:
//   '0x009638faa2c890252f9f7796fe04784f54fc525043474ea71e074c526ba1c41a',
//  next:
//   '0x77f0cbf7f61ff048c7e8920487465e2a167eea6975ed35a81d2b36c64d5be88c' }
