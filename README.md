[![Greenkeeper badge](https://badges.greenkeeper.io/continuous-software/42-cent-omise.svg)](https://greenkeeper.io/) [![Build Status](https://travis-ci.org/continuous-software/42-cent-omise.svg?branch=master)](https://travis-ci.org/continuous-software/42-cent-omise)

<img src="https://image.ibb.co/cjCoCy/omise_logo.jpg" alt="42-cent-omise" height="200"/>

## Installation ##


    $ npm install -s 42-cent-omise

## Usage

```javascript
var Omise = require('42-cent-omise');
var client = new Omise({
    PUBLIC_KEY: '<PLACEHOLDER>',
    SECRET_KEY: '<PLACEHOLDER>'
});
```

## Gateway API

This is an adaptor of [omise-node](https://github.com/omise/omise-node) for [42-cent](https://github.com/continuous-software/42-cent).  
It implements the [BaseGateway](https://github.com/continuous-software/42-cent-base) API.
