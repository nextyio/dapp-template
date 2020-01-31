import BaseService from '../../model/BaseService'
import _ from 'lodash'

export default class extends BaseService {
  async writeState (addMore) {
    const store = this.store.getState()
    const contract = store.contracts.readWrite
    await contract.methods.writeState(addMore).send({ from: store.user.wallet, gasPrice: '0' })
    // this.readState()
  }

  async getReadState () {
    const store = this.store.getState()
    const contract = store.contracts.readWrite
    await contract.methods.readState().call({ from: store.user.wallet }).then((readState) => {
      const readWriteRedux = this.store.getRedux('readWrite')
      this.dispatch(readWriteRedux.actions.readState_update(readState))
    })
  }
}
