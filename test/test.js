'use strict';

var Omise = require('../index.js').factory;
var GatewayError = require('42-cent-base').GatewayError;
var CreditCard = require('42-cent-model').CreditCard;
var Prospect = require('42-cent-model').Prospect;
var assert = require('assert');
var casual = require('casual');
var assign = require('object-assign');


var prospect = new Prospect()
  .withBillingFirstName(casual.first_name)
  .withBillingLastName(casual.last_name)
  .withBillingEmailAddress(casual.email)
  .withBillingPhone(casual.phone)
  .withBillingAddress1(casual.address1)
  .withBillingAddress2(casual.address2)
  .withBillingCity(casual.city)
  .withBillingState(casual.state)
  .withBillingPostalCode('3212')
  .withBillingCountry(casual.country_code)
  .withShippingFirstName(casual.first_name)
  .withShippingLastName(casual.last_name)
  .withShippingAddress1(casual.address1)
  .withShippingAddress2(casual.address2)
  .withShippingCity(casual.city)
  .withShippingState(casual.state)
  .withShippingPostalCode('3212')
  .withShippingCountry(casual.country_code);

var creditCards = {
  visa: new CreditCard()
    .withCreditCardNumber('4111111111111111')
    .withExpirationMonth('11')
    .withExpirationYear('2018')
    .withCvv2('123')
    .withCardHolder(casual.name),
  mastercard: new CreditCard()
    .withCreditCardNumber(casual.card_number('MasterCard'))
    .withExpirationMonth('12')
    .withExpirationYear('2017')
    .withCvv2('123'),
  amex: new CreditCard()
    .withCreditCardNumber(casual.card_number('American Express'))
    .withExpirationMonth('12')
    .withExpirationYear('2017')
    .withCvv2('123'),
  discover: new CreditCard()
    .withCreditCardNumber(casual.card_number('Discover Card'))
    .withExpirationMonth('12')
    .withExpirationYear('2017')
    .withCvv2('123'),
  forbidden: new CreditCard()
    .withCreditCardNumber('5000300020003003')
    .withExpirationMonth('12')
    .withExpirationYear('2017')
    .withCvv2('123')
};

describe('Omise adaptor', function () {

  var service;

  beforeEach(function () {
    service = Omise(process.env.PUBLIC_KEY, process.env.SECRET_KEY, {testMode: true});
  });

  describe('Service', function () {

    it('should submit a transaction', function (done) {
      service.submitTransaction({
        amount: Math.random() * 1000
      }, creditCards.visa, prospect)
        .then(function (transaction) {
          assert(transaction.transactionId, 'transactionId should be defined');
          assert(transaction._original, 'original should be defined');
          assert.equal(transaction._original.captured, true);
          done();
        });
    });

    it('should reject with a GatewayError if the gateway sends an error', function (done) {
      service.submitTransaction({
        amount: Math.random() * 100
      }, assign({}, creditCards.visa, {creditCardNumber: '4000000000000010', expirationYear: '2009'}), prospect)
        .then(function (transaction) {
          throw new Error('should not get here');
        })
        .catch(function (err) {
          assert(err._original);
          assert.equal(err.message, "expiration date cannot be in the past");
          done();
        });
    });

    it('should authorize a transaction', function (done) {

      service.authorizeTransaction({
        amount: Math.random() * 100
      }, creditCards.visa, prospect).then(function (transaction) {
        assert(transaction.transactionId, 'transactionId should be defined');
        assert(transaction._original, 'original should be defined');
        assert.equal(transaction._original.captured, false);
        done();
      });
    });

    it('should reject the promise with a Gateway error if the remote service send an error', function (done) {
      service.authorizeTransaction({
        amount: 2002
      }, assign({}, creditCards.visa, {expirationYear: '2009'}), prospect)
        .then(function (transaction) {
          throw new Error('should not get here');
        })
        .catch(function (err) {
          assert(err._original);
          assert.equal(err.message, "expiration date cannot be in the past");
          done();
        });
    });

    it('should refund transaction', function (done) {

      service.submitTransaction({
        amount: 100
      }, creditCards.visa, prospect)
        .then(function (transaction) {
          assert(transaction.transactionId, 'transactionId should be defined');
          assert(transaction._original, 'original should be defined');
          return service.refundTransaction(transaction.transactionId);
        })
        .then(function (result) {
          assert(result._original, '_original should be defined');
          assert(result._original.amount, 10000);
          done();
        })
    });

    it('should support partial refund', function (done) {
      service.submitTransaction({
        amount: 100
      }, creditCards.visa, prospect)
        .then(function (transaction) {
          assert(transaction.transactionId, 'transactionId should be defined');
          assert(transaction._original, 'original should be defined');
          assert.equal(transaction._original.captured, true);
          return service.refundTransaction(transaction.transactionId, {amount: 25});
        })
        .then(function (result) {
          assert(result._original, '_original should be defined');
          assert.equal(result._original.amount, 2500);
          done();
        });
    });

    it('should reject the promise if the remote service returns an error', function (done) {
      service.submitTransaction({
        amount: 100
      }, creditCards.visa, prospect)
        .then(function (transaction) {
          assert(transaction.transactionId, 'transactionId should be defined');
          assert(transaction._original, 'original should be defined');
          assert.equal(transaction._original.captured, true);
          return service.refundTransaction(transaction.transactionId, {amount: 200});
        })
        .then(function (result) {
          throw new Error('should not get here');
        })
        .catch(function (err) {
          assert(err._original, '_original should be defined');
          assert.equal(err.message, 'amount cannot be higher than the remaining charge amount');
          done();
        });
    });

    // todo void not implemented by Omise
    xit('should void a transaction', function (done) {
      service.authorizeTransaction({
        amount: Math.random() * 100
      }, creditCards.visa, prospect)
        .then(function (transaction) {
          return service.voidTransaction(transaction.transactionId, {});
        })
        .then(function (result) {
          assert(result._original, '_original should be defined');
          assert(result._original.transaction.status, 'voided');
          done();
        })
    });

    xit('should reject promise if remote service returns an error', function (done) {
      service.voidTransaction('ddfsdf')
        .then(function () {
          throw new Error('should not get here');
        })
        .catch(function (err) {
          assert.equal(err.message, 'Not Found');
          done();
        })
    });

    it('should create a customer profile', function (done) {
      service.createCustomerProfile(creditCards.visa, prospect)
        .then(function (result) {
          assert(result.profileId, ' profileId Should be defined');
          assert(result._original, '_original should be defined');
          done();
        })
        .catch(function (err) {
          done(err);
        });
    });

    it('should charge a existing customer', function (done) {
      service.createCustomerProfile(creditCards.visa, prospect)
        .then(function (result) {
          assert(result.profileId, ' profileId Should be defined');
          assert(result._original, '_original should be defined');
          prospect.profileId = result.profileId;
          return service.chargeCustomer({amount: Math.random() * 100}, prospect);
        })
        .then(function (result) {
          assert(result.transactionId);
          done()
        })
        .catch(function (err) {
          done(err);
        });
    });
  });
});
