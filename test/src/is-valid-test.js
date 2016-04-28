'use strict';

var isValid = require('../../src/is-valid');
var should = require('should');  // eslint-disable-line

describe('is-valid', function() {

  describe('isHex', function() {
    it('should pass with valid hex', function() {
      isValid.hex("1").should.be.true();
      isValid.hex("0123456789").should.be.true();
      isValid.hex("abcdef").should.be.true();
      isValid.hex("ABCDEF").should.be.true();
      isValid.hex("AbCdEf").should.be.true();
    });

    it('should pass with nothing', function() {
      isValid.hex("").should.be.true();
    });

    it('should fail with .', function() {
      isValid.hex("1.2").should.be.false();
    });

    it('should fail with g', function() {
      isValid.hex("1g").should.be.false();
    });

    it('should fail with g', function() {
      isValid.hex("-").should.be.false();
    });
  });

  describe('ip4', function() {

    it('should pass a valid ip4 address', function() {
      isValid.ip4Address("1.2.3.4").should.be.true();
      isValid.ip4Address("255.255.255.255").should.be.true();
    });

    it('should fail with large number', function() {
      isValid.ip4Address("256.2.3.4").should.be.false();
    });

    it('should fail with too many periods', function() {
      isValid.ip4Address("1.2.3.4.12").should.be.false();
    });

    it('should fail with too free periods', function() {
      isValid.ip4Address("1.2.3").should.be.false();
    });

    it('should fail with non-numbers', function() {
      isValid.ip4Address("a.b.c.d").should.be.false();
    });

    it('should fail with nothing', function() {
      isValid.ip4Address("").should.be.false();
    });
  });

  describe('ip6', function() {

    it('should pass a valid ip6 address', function() {
      isValid.ip6Address("::1").should.be.true();
      isValid.ip6Address("::ffff").should.be.true();
      isValid.ip6Address("1111:2222:3333:4444:5555:6666:7777:8888").should.be.true();
      isValid.ip6Address("1111::8888").should.be.true();
      isValid.ip6Address("1:2:3:4:5:6:7:8").should.be.true();
      isValid.ip6Address("a:b:c:d:e:f:0:1").should.be.true();
      isValid.ip6Address("A:B:C:D:E:F:0:1").should.be.true();
      isValid.ip6Address("1234:45::12:def").should.be.true();
    });

    it('should fail a valid bad chars', function() {
      isValid.ip6Address("a:b:c:d:e:g:0:1").should.be.false();
    });

    it('should fail a valid too many segments', function() {
      isValid.ip6Address("a:b:c:d:e:f:0:1:2").should.be.false();
    });

    it('should fail with nothing', function() {
      isValid.ip6Address("").should.be.false();
    });

    it('should fail with :', function() {
      isValid.ip6Address(":").should.be.false();
    });

    it('should fail with ::', function() {
      isValid.ip6Address("::").should.be.false();
    });

    it('should fail with :::', function() {
      isValid.ip6Address(":::").should.be.false();
    });

    it('should fail with :n', function() {
      isValid.ip6Address(":1").should.be.false();
    });

    it('should fail with n:', function() {
      isValid.ip6Address("1:").should.be.false();
    });

    it('should fail with n:n', function() {
      isValid.ip6Address("1:1").should.be.false();
    });

    it('should fail with n::n::n', function() {
      isValid.ip6Address("1::1::1").should.be.false();
    });

  });

});
