import _ from "lodash";
import Web3 from "web3";

window.ethereum.request({
  method: "eth_requestAccounts",
});

export default function web3Connect(ABI, ADDRESS) {
  const encryptions = new Promise((resolve, reject) => {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(ABI, ADDRESS);

    const _transction = async (service, ...props) => {
      const callService = _.get(contract, ["methods", service]);
      const accounts = await web3.eth.getAccounts();
      const responseData = await callService(...props)
        .send({
          from: accounts[0],
          value: 0,
        })
        .then((data) => data)
        .catch((error) => {
          const errorData = { error };
          return { error: errorData.error };
        });
      return responseData;
    };

    const _paid_transction = async (cost, service, ...props) => {
      const callService = _.get(contract, ["methods", service]);
      const accounts = await web3.eth.getAccounts();
      const responseData = await callService(...props)
        .send({
          from: accounts[0],
          value: cost,
        })
        .then((data) => data)
        .catch((error) => {
          const errorData = { error };
          return { error: errorData.error };
        });
      return responseData;
    };

    const _account = async () => {
      const accounts = await web3.eth.getAccounts();
      return accounts[0];
    };

    const _conveter = async (price, type) => {
      if (type === "eth-to-wei") {
        return await web3.utils.toWei(price.toString(), "ether");
      } else {
        return await web3.utils.fromWei(price.toString(), "ether");
      }
    };

    const _fetch = async (service, ...props) => {
      const callService = _.get(contract, ["methods", service]);
      let data;
      if (props) {
        data = await callService(...props).call();
      } else {
        data = await callService().call();
      }

      return data;
    };
    resolve({ _transction, _paid_transction, _account, _conveter, _fetch });
  });

  return encryptions;
}
