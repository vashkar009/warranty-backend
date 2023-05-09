# web3-access

> Author: `Biswanath Das`

## Instalation

```sh
yarn add web3-access
```

## How to use

```sh
import Connect from "web3-access";
```

#### Configuration

`index.js`

```sh
import Connect from "web3-access";
import CONTRACT_ABI from "./ABI.json";

const CONTRACT_ADDRESS = "0X000000000"

const connect = Connect(CONTRACT_ABI, CONTRACT_ADDRESS);

const getData = await connect.then(({ _fetch }) =>
      _fetch("getAllposts")
    );
```

# Functions

There are some functions that helps to intract with the blackchanin

#### \_fetch

`_fetch` is used to get data from blockchain network

```sh
const getData = await connect.then(({ _fetch }) =>
      _fetch("getAllposts", optionalParameter)
    );
```

`getAllposts` is the name of coresponding solidity function
`optionalParameter` is the props of that function it may be one or multiple. [`this is optional`].

#### \_transction

`_transction` is used to insert / update data on blockchain network.

```sh
const responseData = await connect.then(({ _transction }) =>_transction("postStory",data));
```

`postStory` is the name of coresponding solidity function.
`data` is the props of that function (may be one or multiple).

#### \_paid_transction

`_paid_transction` is used to insert / update data along with `payment` on blockchain network.

```sh
const responseData = await connect.then(({ _paid_transction }) =>
_paid_transction(1000, "postStory",data));
```

`1000` is the amount to be transfred (unit is `wei`)
`postStory` is the name of coresponding solidity function.
`data` is the props of that function (may be one or multiple).

## Sample Code

```sh
import React, { useState, useEffect } from "react";
import Connect from "web3-access";
import CONTRACT_ABI from "../ABI-connect/MessangerABI/ABI.json";

const CONTRACT_ADDRESS = "0X000000000"

const Timeline = () => {
  const [messages, setMessages] = useState(null);
  const connect = Connect(CONTRACT_ABI, CONTRACT_ADDRESS);

  useEffect(() => {
    fetchAllPosts();
  }, []);

  async function fetchAllPosts() {
    const getAllPosts = await connect.then(({ _fetch }) =>
      _fetch("getAllposts")
    );
    setMessages(getAllPosts);
  }

  return (
    <>
      {messages?.map((data) => {
        return <>{data?.sender}</>;
      })}
    </>
  );
};
export default Timeline;
```
