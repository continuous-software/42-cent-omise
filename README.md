[![Build Status](https://travis-ci.org/continuous-software/42-cent-omise.svg?branch=master)](https://travis-ci.org/continuous-software/42-cent-omise)

![42-cent-omise](http://s10.postimg.org/jlg876lwl/rsz_1cb_28e6ed48002ecd5c39b9fd21d236da17.jpg)

## Installation ##

[![Greenkeeper badge](https://badges.greenkeeper.io/continuous-software/42-cent-omise.svg)](https://greenkeeper.io/)

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
