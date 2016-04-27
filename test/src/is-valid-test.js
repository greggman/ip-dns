var isValid = require('../../src/is-valid');
var should = require('should');

describe('is-valid', function() {

  describe('ip4', function() {

    it('should pass a valid ip4 address', function() {

      isValid.ip4Address("1.2.3.4").should.be.true();
    });
  });
});
