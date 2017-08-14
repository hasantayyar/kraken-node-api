Kraken Api Nodejs Client
========================


[![npm version](https://badge.fury.io/js/kraken-node-api.svg)](https://badge.fury.io/js/kraken-node-api)

ssss package is forked from https://github.com/nothingisdead/npm-kraken-api
I'll keep the package updated.


### Changes
- Build directory added.
- Node 6 support


### Original Readme Content

NodeJS Client Library for the Kraken (kraken.com) API

This is an asynchronous node js client for the kraken.com API. It exposes all the API methods found here: https://www.kraken.com/help/api through the ```api``` method:

Example Usage:

```javascript
const key          = '...'; // API Key
const secret       = '...'; // API Private Key
const KrakenClient = require('kraken-node-api');
const kraken       = new KrakenClient(key, secret);

(async () => {
	// Display user's balance
	console.log(await kraken.api('Balance'));

	// Get Ticker Info
	console.log(await kraken.api('Ticker', { pair : 'XXBTZUSD' }));
})();
```

