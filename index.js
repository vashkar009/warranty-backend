const express = require('express');
const app = express();
const cors = require('cors');
const routes = require('./routes');
var { encode, decode } = require("js-base64");
const Web3 = require('web3');
var CONTACT_ABI = require("./ABI.json");
var CONTACT_ADDRESS = require("./Address.json");
const HDWalletProvider = require('@truffle/hdwallet-provider');
app.use(cors());
app.use(express.json());
const remoteAddress = '0xB928ED8e2dEBD05DB8AC3F85C51DEBe650ef40cE';
const getConfig = (token) => {
const tokenDecoded = decode(token);
const rawToken = JSON.parse(tokenDecoded);
console.log(rawToken);
var mnemonic = rawToken?.WalletPrivateKey;
const provider =  new HDWalletProvider(mnemonic, rawToken?.InfuraNodeURL);
var web3 = new Web3(provider);
const signer = web3.eth.accounts.privateKeyToAccount(rawToken?.WalletPrivateKey);
const contactList = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
return { contactList, signer };
  };
app.get("/", async (req, res) => {
 
	try {
	  
	  res.json({
		message: "The api's is up and Running",
		status: "true",
	  });
	} catch (error) {
	  console.log(error);
	}
  });

const start = async function() {}
start();


//// Get Token Data

app.get("/get-token-data", async (req, res) => {

		if (!req.headers["app-config-token"]) 
		{
			return res.status(401).json({ message: "Missing Authorization Header" });
		}
	     const { contactList, signer } = getConfig(req.headers["app-config-token"]);
		const tokenUID = req?.query?.token;
		app.use(express.json());
		  try {
			const response = await contactList.methods
			  .getTokenDetails(remoteAddress,tokenUID)
			  .call({from: signer.address});
			// console.log(tokenDecoded);
			//  console.log(signer);
			const outputData = response && JSON.parse(response);
			res.json(outputData);
		  } catch (error) {
			console.log(error);

		  }
			
		});
		




   /// Add Transaction

  app.post("/add-transaction", async (req, res) => {
	
	if (!req.headers["app-config-token"]) 
	{
		return res.status(401).json({ message: "Missing Authorization Header" });
	}
	const { contactList, signer } = getConfig(req.headers["app-config-token"]);
	if (!req.body) res.json("Please add body");
  	 console.log(req.body);
	const tokenUID = req?.query?.token;
	const transaction = req?.body?.transaction;
	if (!tokenUID) res.json("Token id missing");
	if (!transaction) res.json("Transaction Type missing");
	const response = await contactList.methods
	  .tokenURI(tokenUID)
	  .call({  from: signer.address });
	const tokenData = response && JSON.parse(response);
	if (tokenData?.transction) {
	  tokenData.transction.push(req.body);
	} else {
	  const transaction = [req.body];
	  tokenData.transction = transaction;
	}
  
	const tokenURI = JSON.stringify(tokenData);
	try {
	  const response = await contactList.methods
		.addData(remoteAddress,tokenUID, tokenURI)
		.send({
		  from: signer.address,
		  value: 0,
          gasLimit: 5000000,
		  gasPrice: 100000000,
		})
		.once("transactionHash", (txhash) => {
		  console.log(`Adding transaction ...`);
		  console.log(txhash);
		  return txhash;
		})
		.catch((error) => {
		  const errorData = { error };
		  return { error: errorData.error };
		});
	  res.json(response);
	} catch (error) {
	  console.log(error);
	}
  });



  app.listen(process.env.PORT || 3081, () => {
	console.log('listening on port '+ (process.env.PORT || 3081));
	
});


