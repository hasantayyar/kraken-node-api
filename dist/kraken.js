'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var got = require('got');
var crypto = require('crypto');
var qs = require('qs');

// Public/Private method names
var methods = {
	public: ['Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC'],
	private: ['Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel']
};

// Default options
var defaults = {
	url: 'https://api.kraken.com',
	version: 0,
	timeout: 5000
};

// Create a signature for a request
var getMessageSignature = function getMessageSignature(path, request, secret, nonce) {
	var message = qs.stringify(request);
	var secret_buffer = new Buffer(secret, 'base64');
	var hash = new crypto.createHash('sha256');
	var hmac = new crypto.createHmac('sha512', secret_buffer);
	var hash_digest = hash.update(nonce + message).digest('binary');
	var hmac_digest = hmac.update(path + hash_digest, 'binary').digest('base64');

	return hmac_digest;
};

// Send an API request
var rawRequest = function () {
	var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(url, headers, data, timeout) {
		var options, _ref2, body, response, error;

		return regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						// Set custom User-Agent string
						headers['User-Agent'] = 'Kraken Javascript API Client';

						options = { headers: headers, timeout: timeout };


						Object.assign(options, {
							method: 'POST',
							body: qs.stringify(data)
						});

						_context.next = 5;
						return got(url, options);

					case 5:
						_ref2 = _context.sent;
						body = _ref2.body;
						response = JSON.parse(body);

						if (!(response.error && response.error.length)) {
							_context.next = 13;
							break;
						}

						error = response.error.filter(function (e) {
							return e.startsWith('E');
						}).map(function (e) {
							return e.substr(1);
						});

						if (error.length) {
							_context.next = 12;
							break;
						}

						throw new Error("Kraken API returned an unknown error");

					case 12:
						throw new Error(error.join(', '));

					case 13:
						return _context.abrupt('return', response);

					case 14:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, undefined);
	}));

	return function rawRequest(_x, _x2, _x3, _x4) {
		return _ref.apply(this, arguments);
	};
}();

/**
 * KrakenClient connects to the Kraken.com API
 * @param {String}        key               API Key
 * @param {String}        secret            API Secret
 * @param {String|Object} [options={}]      Additional options. If a string is passed, will default to just setting `options.otp`.
 * @param {String}        [options.otp]     Two-factor password (optional) (also, doesn't work)
 * @param {Number}        [options.timeout] Maximum timeout (in milliseconds) for all API-calls (passed to `request`)
 */

var KrakenClient = function () {
	function KrakenClient(key, secret, options) {
		_classCallCheck(this, KrakenClient);

		// Allow passing the OTP as the third argument for backwards compatibility
		if (typeof options === 'string') {
			options = { otp: options };
		}

		this.config = Object.assign({ key: key, secret: secret }, defaults, options);
	}

	/**
  * This method makes a public or private API request.
  * @param  {String}   method   The API method (public or private)
  * @param  {Object}   params   Arguments to pass to the api call
  * @param  {Function} callback A callback function to be executed when the request is complete
  * @return {Object}            The request object
  */


	_createClass(KrakenClient, [{
		key: 'api',
		value: function api(method, params, callback) {
			// Default params to empty object
			if (typeof params === 'function') {
				callback = params;
				params = {};
			}

			if (methods.public.includes(method)) {
				return this.publicMethod(method, params, callback);
			} else if (methods.private.includes(method)) {
				return this.privateMethod(method, params, callback);
			} else {
				throw new Error(method + ' is not a valid API method.');
			}
		}

		/**
   * This method makes a public API request.
   * @param  {String}   method   The API method (public or private)
   * @param  {Object}   params   Arguments to pass to the api call
   * @param  {Function} callback A callback function to be executed when the request is complete
   * @return {Object}            The request object
   */

	}, {
		key: 'publicMethod',
		value: function publicMethod(method, params, callback) {
			params = params || {};

			// Default params to empty object
			if (typeof params === 'function') {
				callback = params;
				params = {};
			}

			var path = '/' + this.config.version + '/public/' + method;
			var url = this.config.url + path;
			var response = rawRequest(url, {}, params, this.config.timeout);

			if (typeof callback === 'function') {
				response.then(function (result) {
					return callback(null, result);
				}).catch(function (error) {
					return callback(error, null);
				});
			}

			return response;
		}

		/**
   * This method makes a private API request.
   * @param  {String}   method   The API method (public or private)
   * @param  {Object}   params   Arguments to pass to the api call
   * @param  {Function} callback A callback function to be executed when the request is complete
   * @return {Object}            The request object
   */

	}, {
		key: 'privateMethod',
		value: function privateMethod(method, params, callback) {
			params = params || {};

			// Default params to empty object
			if (typeof params === 'function') {
				callback = params;
				params = {};
			}

			var path = '/' + this.config.version + '/private/' + method;
			var url = this.config.url + path;

			if (!params.nonce) {
				params.nonce = new Date() * 1000; // spoof microsecond
			}

			if (this.config.otp !== undefined) {
				params.otp = this.config.otp;
			}

			var signature = getMessageSignature(path, params, this.config.secret, params.nonce);

			var headers = {
				'API-Key': this.config.key,
				'API-Sign': signature
			};

			var response = rawRequest(url, headers, params, this.config.timeout);

			if (typeof callback === 'function') {
				response.then(function (result) {
					return callback(null, result);
				}).catch(function (error) {
					return callback(error, null);
				});
			}

			return response;
		}
	}]);

	return KrakenClient;
}();

module.exports = KrakenClient;
//# sourceMappingURL=kraken.js.map