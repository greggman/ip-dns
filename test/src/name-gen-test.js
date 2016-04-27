'use strict';

var NameGen = require('../../src/name-gen');
var should = require('should');  // eslint-disable-line

describe('NameGen', function() {

  var nameGen = new NameGen();
  var sha256base32Length = 56;

  it('should create a name with only ip4 addresses', function() {
    var name = nameGen.gen({
      id: "foobar1245",
      i4: "1.23.34.243",
      x4: "123.34.56.12",
    });
    name.length.should.be.equal(sha256base32Length);
  });

  it('should create same name regardless of order', function() {
    var name1 = nameGen.gen({
      id: "foobar1245",
      i4: "1.23.34.243",
      x4: "123.34.56.12",
    });
    var name2 = nameGen.gen({
      i4: "1.23.34.243",
      id: "foobar1245",
      x4: "123.34.56.12",
    });
    var name3 = nameGen.gen({
      x4: "123.34.56.12",
      i4: "1.23.34.243",
      id: "foobar1245",
    });
    name1.should.be.equal(name2);
    name1.should.be.equal(name3);
  });

  it('should create a name with ip6 addresses', function() {
    var nameip4 = nameGen.gen({
      id: "foobar1245",
      i4: "1.23.34.243",
      x4: "123.34.56.12",
    });
    var nameip6 = nameGen.gen({
      id: "foobar1245",
      i4: "1.23.34.243",
      x4: "123.34.56.12",
      i6: "1234:4567",
      x6: "1234:45::12:def",
    });
    nameip4.length.should.be.equal(sha256base32Length);
    nameip6.length.should.be.equal(sha256base32Length);
    nameip6.should.not.be.equal(nameip4);
  });

  it('should throw with bad ip4 address', function() {
    ['i4', 'x4'].forEach(function(key) {
      [
        'abc',
        '256.1.2.3',
        '1.256.2.3',
        '2.5.256.0',
        '2.3.0.256',
        '1.2,3.4',
      ].forEach(function(bad) {
        var options = {
          id: "foobar1245",
          i4: "1.2.4.5",
          x4: "123.34.56.12",
        };
        options[key] = bad;
        (() => {
          nameGen.gen(options);
        }).should.throw();
      });
    });
  });

  it('should throw with bad ip6 address', function() {
    ['i6', 'x6'].forEach(function(key) {
      [
        '1234:defg',
        '1:2:3:4:5:6:7:8:9',
        '1:2:3:4/40',
      ].forEach(function(bad) {
        var options = {
          id: "foobar1245",
          i4: "1.2.3.4",
          x4: "123.34.56.12",
          i6: "1234:4567",
          x6: "1234:45::12:def",
        };
        options[key] = bad;
        (() => {
          nameGen.gen(options);
        }).should.throw();
      });
    });
  });

  it('should throw with short id', function() {
    var options = {
      id: "foobar123",
      i4: "1.2.3.4",
      x4: "123.34.56.12",
      i6: "1234:4567",
      x6: "1234:45::12:def",
    };
    (() => {
      nameGen.gen(options);
    }).should.throw();
  });

});
