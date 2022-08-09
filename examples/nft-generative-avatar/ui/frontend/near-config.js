const CONTRACT_NAME = process.env.CONTRACT_NAME || "nft2.jswm.testnet";
const JSVM_ACCOUNT = process.env.JSVM_ACCOUNT_NAME || "jsvm.testnet";

function getConfig(env) {
  switch (env) {

    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        contractName: CONTRACT_NAME,
        jsvmAccountId: JSVM_ACCOUNT,
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
      };
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: CONTRACT_NAME,
        jsvmAccountId: JSVM_ACCOUNT,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
      };
    case 'betanet':
      return {
        networkId: 'betanet',
        nodeUrl: 'https://rpc.betanet.near.org',
        contractName: CONTRACT_NAME,
        walletUrl: 'https://wallet.betanet.near.org',
        helperUrl: 'https://helper.betanet.near.org',
        explorerUrl: 'https://explorer.betanet.near.org',
      };
    case 'local':
      return {
        networkId: 'local',
        nodeUrl: 'http://localhost:3030',
        keyPath: `${process.env.HOME}/.near/validator_key.json`,
        walletUrl: 'http://localhost:4000/wallet',
        contractName: CONTRACT_NAME,
      };
    case 'test':
    case 'ci':
      return {
        networkId: 'shared-test',
        nodeUrl: 'https://rpc.ci-testnet.near.org',
        contractName: CONTRACT_NAME,
        masterAccount: 'test.near',
      };
    case 'ci-betanet':
      return {
        networkId: 'shared-test-staging',
        nodeUrl: 'https://rpc.ci-betanet.near.org',
        contractName: CONTRACT_NAME,
        masterAccount: 'test.near',
      };
    default:
      throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
  }
}


function callJsvm(method, args, attachedDeposit) {
  return window.contract.account.functionCall({
    contractId: window.config.jsvmAccountId,
    methodName: "call_js_contract",
    args: encodeCall(window.config.contractName, method, args),
    gas: "30000000000000",
    attachedDeposit
  });
}

function viewJsvm(method, args) {
  return window.contract.account.viewFunction(
      window.config.jsvmAccountId,
      'view_js_contract',
      encodeCall(window.config.contractName, method, args),
      {
        stringify: (val) => val}
  );
}

module.exports = {getConfig, viewJsvm, callJsvm}

function encodeCall(contract, method, args) {
  return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
  //return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(args)])
}
