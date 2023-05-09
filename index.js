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
const remoteAddress = '0xB7E512D328af8976b0341492bca7dC2E0d3E5155';
const getConfig = (token) => {
const tokenDecoded = decode(token);
const rawToken = JSON.parse(tokenDecoded);
//console.log(rawToken);
var mnemonic = rawToken?.WalletPrivateKey;
const provider =  new HDWalletProvider(mnemonic, rawToken?.InfuraNodeURL);
var web3 = new Web3(provider);
const signer = web3.eth.accounts.privateKeyToAccount(rawToken?.WalletPrivateKey);
const contactList = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
return { contactList, signer,web3};
  };
app.get("/", async (req, res) => {
	try {
	  res.json({
		message: "The Warranty Blockchain api's are up and Running - warranty backend",
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
	//console.log(req.body.transaction[0]);
	//console.log(req.body.customerWarranty[0]);
	const { contactList, signer,web3} = getConfig(req.headers["app-config-token"]);
	 if (!req.body) res.json("Please add body");
  
	 const tokenUID = req?.query?.token;
	 if (!tokenUID) res.json("Token id missing");
  
	 const response = await contactList.methods
	 .getTokenDetails(remoteAddress,tokenUID)
	   .call({  from: signer.address });
	 const tokenData = response && JSON.parse(response);
	 if (tokenData?.transction) {
	   tokenData.transction.push(req.body.transaction[0]);
	 } else 
	 {
	  const transaction = [req.body.transaction[0]];
	  tokenData.transction = transaction;
	 }
	 if (tokenData?.customerWarranty) {
		tokenData.customerWarranty.push(req.body.customerWarranty[0]);
	  } else 
	  {
	   const customerWarranty = [req.body.customerWarranty[0]];
	   tokenData.customerWarranty = customerWarranty;
	  }

	 const tokenURI = JSON.stringify(tokenData);

	// console.log(tokenURI);
	
	 let nounce = await web3.eth.getTransactionCount(signer.address);	
	 try {
	   const response = await contactList.methods
	  .addTokenData(remoteAddress,tokenUID, tokenURI)
		.send({
	 		from: signer.address,
	 		nonce   : web3.utils.toHex(nounce),
	 		gasLimit: 5000000,
	 		value : 0,
			gasPrice :  web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
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
	console.log('listening on port '+ (process.env.PORT || 3081
		));
	
});


