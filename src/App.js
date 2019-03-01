import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import Web3 from "web3";
import { Button } from 'reactstrap';
//Import contract ABI and address from migrated result with Truffle
import contractReadWriteContent from "./build/contracts/ReadWrite.json";
var web3;
var networkId = 66666;
var contractReadWrite;
class App extends Component {
  constructor(props) {
	  super(props);
	  this.state = {account: "Not loaded", stateCount: "Not loaded", status: ""}
  }
  componentDidMount() {
	// Modern DApp Browsers
	if (window.ethereum) {
		web3 = new Web3(window.ethereum);
		try { 
			window.ethereum.enable();
		} catch(e) {
			alert("You have to accept connection to Metamask to use this dApp");
			// User has denied account access to DApp...
		}
	}
	// Legacy DApp Browsers
	else if (window.web3) {
		web3 = new Web3(web3.currentProvider);
	}
	if (web3) {
		web3.eth.getAccounts((error, accounts) => {
			if (error) {
				console.log(error)
			}
			if (accounts && accounts.length > 0) {
				this.setState({account:accounts[0]});
				contractReadWrite = new web3.eth.Contract(contractReadWriteContent.abi, contractReadWriteContent.networks[networkId].address, {from: this.state.account});
			}else{
				alert("Please unlock Metamask or setup new account in Metamask")
			}
		});
	}
	// Non-DApp Browsers
	else {
		alert('You have to install MetaMask or Nexty Wallet to run this dApp !');
	}
  }
  readState = function () {
	  if (contractReadWrite) {
		this.setState({status:"Loading..."});
		contractReadWrite.methods.readState().call({from: this.state.account}).then((result) => {
			this.setState({stateCount:result});
			this.setState({status:""});
		});
	  }
  }
  writeState = function (param) {
	if (contractReadWrite) {
		this.setState({status:"Please confirm TX Sending with Metamask/TrustWallet/NextyWallet then wait until tx is confirmed..."});
		contractReadWrite.methods.writeState(param).send({from: this.state.account}).then((result) => {
			if (result.blockNumber>0) {
				this.readState();
			}
		});
	  }
  }
  render() {
    return (
		<div className="App">
        <header className="App-header">
		<img src={logo} className="App-logo" alt="logo" />
			<p>
				Nexty Platform: dApp Template
			</p>
			<Button className="btn" color="info" onClick={() => this.readState()} >Call readState()</Button>
			<Button className="btn" color="warning" onClick={() => this.writeState(2)}>Send writeState(2)</Button>
			<div className="text-primary">stateCount value: {this.state.stateCount}</div>
			<div className="text-info">Account: {this.state.account}</div>			
			<div className="text-warning">{this.state.status}</div>
        </header>
      	</div>
    );
  }
}

export default App;
