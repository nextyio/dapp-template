This is a combination between Truffle and ReactJS to create a bootstrapped dApp running on Nexty Platform. It is now easier to deploy smart contracts and smoothly integrate it with your frontend.

## Installation

### Truffle

`npm install -g truffle`

### Clone git repository

`git clone https://github.com/nextyio/dapp-template.git`

### Init your Nodejs folder

`npm install`

### Develop your smart contract

We have `contracts` folder in your cloned directory: `dapp-template`. Put your dapps' solidity files here. To learn solidity, you can refer to [https://solidity.readthedocs.io](https://solidity.readthedocs.io)

### Adjust migration scripts for your developed smart contracts:

Look at `dapp-template/migrations/` and specify your developed smart contracts. Truffle will automatically navigate all files and follow your migrations scenario.

### Deploy your smart contracts

`truffle deploy`

Remember to specify your private key for deployment in `.env` file, which has been sampled in `.env.sample`. This `.env` files will assign the envirnonment variables to use in `truffle_script.js` by `dotenv` module and your react application. You can also specify port for running webapp in this file by putting `PORT=3006` right below the `PRIVATE_KEY` line.

### Interact with deployed smart contracts

As configured in `truffle-config.js`, All deployed contracts' information would be located in `src/build/contracts/***.json`. Your frontend scripts can import variables from this directory files, automatically with truffle deployment.

### Start your webapp

In the project directory, you can run:

`npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) / or with your specified port in `.env` file, to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

`npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

`npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More about developing your reactjs application

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
