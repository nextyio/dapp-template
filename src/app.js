import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import _ from 'lodash'
import { Route, Switch } from 'react-router-dom' // eslint-disable-line
import { Provider } from 'react-redux' // eslint-disable-line
import { ConnectedRouter } from 'react-router-redux' // eslint-disable-line
import store from '@/store'
import config from '@/config'
import { USER_ROLE } from '@/constant'
import { api_request } from './util' // eslint-disable-line
import UserService from '@/service/UserService'
import { CONTRACTS } from '@/constant'
import Web3 from 'web3'

import './boot'
import './style/index.scss'

console.log(CONTRACTS)

const middleware = (render, props) => {
  return render
}

const App = () => { // eslint-disable-line
  return (
    <div>
      <Helmet>
        {/* <script defer src="/assets/js/web310.js"></script> */}
      </Helmet>
      <Switch id="ss-main">
        {_.map(config.router, (item, i) => {
          const props = _.omit(item, ['page', 'path', 'type'])
          const R = item.type || Route // eslint-disable-line
          return (
            <R path={item.path} key={i} exact component={item.page} {...props} />
          )
        })}
      </Switch>
    </div>
  )
}

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter middleware={middleware} history={store.history}>
        <App />
      </ConnectedRouter>
    </Provider>,
    document.getElementById('ss-root')
  )
}

const userRedux = store.getRedux('user')
const contractsRedux = store.getRedux('contracts')
const userService = new UserService()
let isRequest = false
let isLoggedIn = false

function setupWeb3 () {
  window.web3.eth.getAccounts(async (err, accounts) => {
    if (err) return
    if (accounts.length > 0) {
      window.web3.version.getNetwork((err, networkId) => {
        if (err) {
          console.error(err)
          return
        }

        // detect account switch
        const wallet = store.getState().user.wallet;
        isLoggedIn = isLoggedIn && wallet === accounts[0];

        if (!isLoggedIn) {
          const web3 = new Web3(window.ethereum)

          const contracts = {
            ReadWrite: new web3.eth.Contract(CONTRACTS.ReadWrite.abi, CONTRACTS.ReadWrite.address)
          }

          store.dispatch(userRedux.actions.loginMetamask_update(true))
          store.dispatch(contractsRedux.actions.readWrite_update(contracts.ReadWrite))
          store.dispatch(userRedux.actions.web3_update(web3))

          userService.metaMaskLogin(accounts[0])
          isLoggedIn = true

          // simple trick: not work for entering .../login directly to the browser
          if (userService.path.location.pathname === '/login') {
            userService.path.goBack()
          }
        }
      })
    } else {
      if (!isRequest) {
        isRequest = true
        await window.ethereum.enable()
      }
      store.dispatch(userRedux.actions.loginMetamask_update(false))
      isLoggedIn = false
      userService.path.push('/login')
    }
  })
}

if (window.ethereum) {
  setupWeb3()
  if (window.web3.currentProvider.publicConfigStore) {
    window.web3.currentProvider.publicConfigStore.on('update', async () => {
      setupWeb3()
    })
  }
} else {
  store.dispatch(userRedux.actions.loginMetamask_update(false))
}

if (sessionStorage.getItem('api-token')) { // eslint-disable-line
  const userRedux = store.getRedux('user')
  api_request({
    path: '/user/current_user',
    success: data => {
      store.dispatch(userRedux.actions.is_login_update(true))
      if ([USER_ROLE.ADMIN, USER_ROLE.COUNCIL].includes(data.role)) {
        store.dispatch(userRedux.actions.is_admin_update(true))
      }
      store.dispatch(userRedux.actions.profile_update(data.profile))
      store.dispatch(userRedux.actions.role_update(data.role))

      render()
    }
  })
} else {
  render()
}
