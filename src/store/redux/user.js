import BaseRedux from '@/model/BaseRedux'

class UserRedux extends BaseRedux {
  defineTypes () {
    return ['user']
  }

  defineDefaultState () {
    return {
      is_login: false,
      is_admin: false,

      login_form: {
        privatekey: '',
        loading: false
      },

      web3: null,
      profile: null,
      blockNumber: 0,
      wallet: null,
      balance: 0,
      inflated: 0,
      exVol: 0,
      exStb: 0,
      volAllowance: 0,
      stbAllowance: 0,
      loginMetamask: true
    }
  }
}

export default new UserRedux()
