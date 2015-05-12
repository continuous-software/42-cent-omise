var Omise42 = require('./lib/Omise.js');
var omise = require('omise');
var assert=require('assert');

module.exports = {
  factory: function  (options) {
    assert(options.PUBLIC_KEY, 'PUBLIC_KEY is mandatory');
    assert(options.SECRET_KEY, 'SECRET_KEY is mandatory');
    options = options || {};
    var service = new Omise42(options);
    Object.defineProperty(service, '_delegate', {
      value: omise({
        publicKey: options.PUBLIC_KEY,
        secretKey: options.SECRET_KEY
      })
    });
    return service;
  },
  Omise: Omise42
};
