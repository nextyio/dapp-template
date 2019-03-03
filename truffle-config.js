const HDWalletProvider = require('truffle-hdwallet-provider');
const path = require("path");

require('dotenv').config()

module.exports = {
   networks: {
	development: {
		provider : () => new HDWalletProvider(process.env.PRIVATE_KEY,"http://45.77.22.149:8545"),
		//provider : () => new HDWalletProvider(process.env.PRIVATE_KEY,"http://13.228.68.50:8545"),
		network_id: "*"
	},
	production: {
		provider : () => new HDWalletProvider(process.env.PRIVATE_KEY,"https://ss.nexty.io"),
		network_id: 66666
	}
  },
  contracts_build_directory: path.join(__dirname, "src/build/contracts")
}