var util = require('util');
var BaseGateway = require('42-cent-base').BaseGateway;
var GatewayError = require('42-cent-base').GatewayError;
var mapKeys = require('42-cent-util').mapKeys;
var assert = require('assert');
var assign = require('object-assign');

var creditCardSchema = {
  creditCardNumber: 'number',
  expirationMonth: 'expiration_month',
  expirationYear: 'expiration_year',
  cvv2: 'security_code',
  cardHolder: 'name'
};

var billingSchema = {
  billingPostalCode: 'postal_code',
  billingCity: 'city'
};


function Omise42 (options) {
  BaseGateway.call(this, options);
}

util.inherits(Omise42, BaseGateway);

Omise42.prototype.submitTransaction = function submitTransaction (order, creditcard, prospect, other) {

  var card = mapKeys(creditcard, creditCardSchema);
  card = assign(card, mapKeys(prospect, billingSchema));
  var delegate = this._delegate;

  return delegate.tokens.create({
    card: card
  })
    .then(function (result) {
      var token = result.id;
      var payload = {
        amount: Math.round((+order.amount).toFixed(2) * 100),
        card: token,
        capture: "true",
        currency: order.currency || 'thb'
      };
      assign(payload, other || {});
      return delegate.charges.create(payload);
    })
    .then(function (result) {
      return {
        _original: result,
        transactionId: result.id
      };
    })
    .catch(function (err) {
      throw new GatewayError(err.message || 'remote error', err);
    });
};

Omise42.prototype.authorizeTransaction = function authorizeTransaction (order, creditcard, prospect, other) {
  return this.submitTransaction(order, creditcard, prospect, assign(other || {}, {capture: "false"}));
};

Omise42.prototype.refundTransaction = function refundTransaction (transactionId, options) {
  options = options || {};
  var delegate = this._delegate;
  var args = [transactionId];
  if (options.amount) {
    args.push({amount: Math.round((+options.amount).toFixed(2) * 100)});
  }

  return delegate.charges.createRefund.apply(delegate.charges, args)
    .then(function (result) {
      return {
        _original: result
      };
    })
    .catch(function (err) {
      throw new GatewayError(err.message || 'remote error', err);
    })
};

Omise42.prototype.createCustomerProfile = function createCustomerProfile (creditcard, billing, shipping, other) {
  var card = mapKeys(creditcard, creditCardSchema);
  card = assign(card, mapKeys(billing, billingSchema));
  var delegate = this._delegate;

  return delegate.tokens.create({
    card: card
  })
    .then(function (result) {
      var customer = {};
      if (billing && billing.billingEmailAddress) {
        customer.email = billing.billingEmailAddress;
      }
      assign(customer, {card:result.id}, other);
      return delegate.customers.create(customer);
    })
    .then(function (result) {
      return {
        _original: result,
        profileId: result.id
      };
    })
    .catch(function (err) {
      throw new GatewayError(err.message || 'remote error', err);
    });
};

Omise42.prototype.chargeCustomer = function chargeCustomer (order, prospect, other) {
  var delegate = this._delegate;
  var payload = {
    amount: Math.round((+order.amount).toFixed(2) * 100),
    capture: "true",
    currency: order.currency || 'thb',
    customer:prospect.profileId
  };
  assign(payload, other || {});
  return delegate.charges.create(payload)
    .then(function (result) {
      return {
        _original: result,
        transactionId: result.id
      };
    })
    .catch(function (err) {
      throw new GatewayError(err.message || 'remote error', err);
    });

};

module.exports = Omise42;
