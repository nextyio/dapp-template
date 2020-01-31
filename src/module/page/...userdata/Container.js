import { createContainer } from '@/util'
import Component from './Component'
// import NTFToken from '@/service/NTFToken'
import NtfTokenService from '@/service/contracts/NtfTokenService'
import NtfPoolService from '@/service/contracts/NtfPoolService'
import UserService from '@/service/UserService'
var curWallet = null
export default createContainer(Component, (state) => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()
  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    userService.getBalance()

    ntfTokenService.loadMyNtfBalance()

    ntfPoolService.loadMyDepositedNtf()
    ntfPoolService.loadPoolAddress()
    ntfPoolService.loadUnlockTime()
    ntfPoolService.loadIsLocking()
  }

  return {
    wallet: state.user.wallet,
    balance: state.user.balance,
    myNtfBalance: state.user.ntfBalance,
    myNtfDeposited: state.user.ntfDeposited,
    myUnlockTime: state.user.unlockTime,

    poolAddress: state.pool.address,
    isLocking: state.user.isLocking
  }
}, () => {
  // const ntfTokenService = new NTFToken()
  // const nextyManagerService = new NextyManager()
  const userService = new UserService()

  return {

    getWallet () {
      userService.getWallet()
    },
    async getBalance () {
      await userService.getBalance()
    }
  }
})
