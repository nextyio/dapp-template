import BaseRedux from '@/model/BaseRedux'

class ReadWriteRedux extends BaseRedux {
  defineTypes () {
    return ['readWrite']
  }

  defineDefaultState () {
    return {
      readState: null
    }
  }
}

export default new ReadWriteRedux()
