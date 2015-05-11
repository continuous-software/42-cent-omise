var Omise42 = require('./lib/Omise.js');
var omise = require('omise');
var assert=require('assert');

module.exports = {
  factory: function (publicKey, secretKey, options) {
    assert(publicKey, 'publicKey is mandatory');
    assert(secretKey, 'secretKey is mandatory');
    options = options || {};
    var service = new Omise42(options);
    Object.defineProperty(service, '_delegate', {
      value: omise({
        publicKey: publicKey,
        secretKey: secretKey
      })
    });
    return service;
  },
  Omise: Omise42
};
