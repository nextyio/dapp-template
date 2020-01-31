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
  async function load () {
    userService.getBalance()

    ntfTokenService.loadMyNtfBalance()

    ntfPoolService.loadMyRewardBalance()
    ntfPoolService.loadMyDepositedNtf()
    ntfPoolService.loadPoolAddress()
    ntfPoolService.loadUnlockTime()
    ntfPoolService.loadIsLocking()
  }

  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    load()
    setInterval(() => {
      load()
    }, 5000)
  }

  return {
    wallet: state.user.wallet,
    balance: state.user.balance,
    myNtfBalance: state.user.ntfBalance,
    myRewardBalance: state.user.rewardBalance,
    myNtfDeposited: state.user.ntfDeposited,
    myUnlockTime: state.user.unlockTime,

    poolAddress: state.pool.address,
    isLocking: state.user.isLocking
  }
}, () => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  return {
    async approve (_amount) {
      return await ntfTokenService.approve(_amount)
    },
    async deposit (_amount) {
      return await ntfPoolService.deposit(_amount)
    },
    async withdraw (_amount) {
      return await ntfPoolService.withdraw(_amount)
    },
    async claim () {
      return await ntfPoolService.claim()
    }
  }
})
