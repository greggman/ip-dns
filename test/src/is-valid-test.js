'use strict';

var isValid = require('../../src/is-valid');
var should = require('should');  // eslint-disable-line

describe('is-valid', function() {

  describe('ip4', function() {

    it('should pass a valid ip4 address', function() {
      isValid.ip4Address("1.2.3.4").should.be.true();
      isValid.ip4Address("255.255.255.255").should.be.true();
    });

    it('should fail ip4 address with large number', function() {
      isValid.ip4Address("256.2.3.4").should.be.false();
    });
  });
});
