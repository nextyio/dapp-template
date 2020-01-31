import BaseRedux from '@/model/BaseRedux';

class ReadWriteRedux extends BaseRedux {
  defineTypes () {
    return ['readWrite']
  }

  defineDefaultState () {
    return {
    }
  }
}

export default new ReadWriteRedux()
