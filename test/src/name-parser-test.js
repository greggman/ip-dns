'use strict';

var NameParser = require('../../src/name-parser');
var NameGen = require('../../src/name-gen');
var should = require('should');  // eslint-disable-line

describe('NameParser', function() {

    var suffix = 'foo.com';
    var nameInfo = {
      version: 34,
      id: 'foobar1234',
      i4: '111.22.3.44',
      x4: '222.33.4.55',
    };

    var nameGen = new NameGen();
    var expectedName = nameGen.gen(nameInfo);

    it('should parse what it creates', function() {
      var expected = 'v34i' + expectedName + '.' + suffix;
      var np = new NameParser(suffix);
      var name = np.gen(nameInfo);
      name.should.be.equal(expected);
      var info = np.parse(name);
      info.version.should.be.equal(nameInfo.version);
      info.external.should.be.equal(false);
      info.id.should.be.equal(expectedName);
    });

    it('should parse x', function() {
      var name = 'v34x' + expectedName + '.' + suffix;
      var np = new NameParser(suffix);
      var info = np.parse(name);
      info.version.should.be.equal(nameInfo.version);
      info.external.should.be.equal(true);
      info.id.should.be.equal(expectedName);
    });

    it('should fail with lowercase id', function() {
      var name = 'v34x' + expectedName + '.' + suffix;
      var np = new NameParser(suffix);
      (() => {
        np.parse(name.toLowerCase());
      }).should.throw();
    });

    it('should fail with missing v', function() {
      var name = 'v34x' + expectedName + '.' + suffix;
      var np = new NameParser(suffix);
      (() => {
        np.parse('k' + name.substr(1));
      }).should.throw();
    });

    it('should fail with missing ix', function() {
      var name = 'v34x' + expectedName + '.' + suffix;
      var np = new NameParser(suffix);
      (() => {
        np.parse(name.substr(0, 3) + 'p' + name.substr(4));
      }).should.throw();
    });

    it('should fail with bad suffix', function() {
      var name = 'v34x' + expectedName + '.' + 'bar.com';
      var np = new NameParser(suffix);
      (() => {
        np.parse(name);
      }).should.throw();
    });
});
