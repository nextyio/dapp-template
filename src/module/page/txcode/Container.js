import { createContainer } from '@/util'
import Component from './Component'
import UserService from '@/service/UserService'
import ReadWriteService from '@/service/contracts/readWriteService'
var curWallet = null
export default createContainer(Component, (state) => {
  const userService = new UserService()
  const readWriteService = new ReadWriteService()

  async function loadOnInit () {
    load()
  }

  async function load () {
    userService.loadBlockNumber()
    userService.getBalance()
    readWriteService.getReadState()
  }

  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    loadOnInit()
    setInterval(() => {
      load()
    }, 5000)
  }

  return {
    wallet: state.user.wallet,
    balance: state.user.balance,
    readState: state.readWrite.readState
  }
}, () => {
  const readWriteService = new ReadWriteService()

  return {
    async send (addMore) {
      readWriteService.writeState(addMore)
    }
  }
})
