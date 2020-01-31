import React from 'react' // eslint-disable-line
import StandardPage from '../StandardPage'
import { Col, Spin } from 'antd' // eslint-disable-line

import './style.scss'

export default class extends StandardPage {
  ord_renderContent () { // eslint-disable-line
    return (
      <div>
        <div className="p_login ebp-wrap" >
          <Col span={24} style={{ marginTop: '30px', marginBottom: '30px' }}>
            {(this.props.loginMetamask) && <div>
              <Spin tip="Logging in with MetaMask...">
              </Spin>
            </div>}
            {(!this.props.loginMetamask) && <div className="login-metamask">
              <img src="/assets/images/metamask.svg" with="100px" height="100px" />
              <h3>Login with
                <span> </span><a href="https://metamask.io/" target="_blank">MetaMask</a> or
                <span> </span><a href="https://ezdefi.com" target="_blank">ezDeFi Extension (Alpha)</a>
              </h3>
            </div>}
          </Col>

        </div>
      </div>
    )
  }

  ord_checkLogin (isLogin) { // eslint-disable-line
    if (isLogin) {
      this.props.history.replace('/manage')
    }
  }
}
