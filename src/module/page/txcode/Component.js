import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import { Link } from 'react-router-dom' // eslint-disable-line
import { thousands, weiToMNTY, weiToNUSD, } from '@/util/help.js'

import './style.scss'

import { Col, Row, Icon, Button, Breadcrumb, Input, InputNumber } from 'antd' // eslint-disable-line

export default class extends LoggedInPage {
  state = {
  }

  async componentDidMount() {
    // this.reload()
  }

  ord_renderContent () { // eslint-disable-line
    return (
      <div className="">
        <div className="ebp-page">
          <h3 className="text-center">Dashboard</h3>
          <div className="ant-col-md-18 ant-col-md-offset-3 text-alert" style={{ 'textAlign': 'left' }}>

            <Row>
              <Col span={6}>
                Wallet:
              </Col>
              <Col span={6}>
                {this.props.wallet}
              </Col>
            </Row>

            <Row>
              <Col span={6}>
                Balance:
              </Col>
              <Col span={18}>
                {thousands(this.props.balance)} NTY
              </Col>
            </Row>

            <Row>
              <Col span={6}>
                readState:
              </Col>
              <Col span={18}>
                {this.props.readState}
              </Col>
            </Row>

            <div className="ebp-header-divider dashboard-rate-margin">
            </div>

            <h3 className="text-center">Write State</h3>

            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
              <Col span={10}>
                <Input className="maxWidth"
                  placeholder="Integer to add to State"
                  value={this.state.addMore}
                  onChange={this.addMoreChange.bind(this)}
                />
              </Col>
              <Col span={4}/>
              <Col span={10}>
                <Button type="primary" onClick={() => this.send()}
                  className="btn-margin-top submit-button maxWidth">Send</Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    )
  }

  ord_renderBreadcrumb () { // eslint-disable-line
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/home"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item>txcode</Breadcrumb.Item>
      </Breadcrumb>
    )
  }
 
send() {
  this.props.send(this.state.addMore);
}

reload() {
  this.props.reload();
}

addMoreChange(e) {
  this.setState({
    addMore: e.target.value
  })
}

}
