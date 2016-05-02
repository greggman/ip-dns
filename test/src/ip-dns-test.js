'use strict';

const DNSServer = require('../../src/ip-dns');
const should = require('should');  // eslint-disable-line
const dns = require('native-dns');



class FakeDNSDb {
  constructor() {
    this.content = {
      A:    { in: '1.2.3.4',    out: '1.2.3.4', },
      AAAA: { in: '1234::5678', out: '1234:0:0:0:0:0:0:5678', },
      TXT:  { in: 'txtcontent', out: ['txtcontent'], },
    };
  }

  get(name, type) {
    switch (type) {
      case 'A':
      case 'AAAA':
      case 'TXT':
        return Promise.resolve({content: this.content[type].in});
      default:
        return Promise.reject("unknown type:" + type);
    }
  }
}

function dnsRequest(options, question, callback) {
  var req = new dns.Request({
    question: question,
    server: options,
    timeout: 10000,  // longer than mocha
  });
  var gotMessage = false;
  var answer;

  req.on('message', (err, result) => {
    gotMessage = true;
    should.not.exist(err);
    should.not.exist(answer);
    answer = JSON.parse(JSON.stringify(result.answer));
  });

  req.on('end', function() {
    gotMessage.should.be.true();
    callback(answer);
  });

  req.send();
}

describe('IPDns', () => {

  function sharedTests(dnsServer, options) {

    it('responds to A requests', (done) => {
      dnsRequest(options, new dns.Question({
        name: "foobar.com",
        type: 'A',
      }), (answer) => {
        answer.length.should.be.equal(1);
        answer[0].address.should.be.equal(options.db.content.A.out);
        done();
      });
    });

    it('responds to AAAA requests', (done) => {
      dnsRequest(options, new dns.Question({
        name: "foobar.com",
        type: 'AAAA',
      }), (answer) => {
        answer.length.should.be.equal(1);
        answer[0].address.should.be.equal(options.db.content.AAAA.out);
        done();
      });
    });

    it('responds to TXT requests', (done) => {
      dnsRequest(options, new dns.Question({
        name: "foobar.com",
        type: 'TXT',
      }), (answer) => {
        answer.length.should.be.equal(1);
        answer[0].data.should.be.deepEqual(options.db.content.TXT.out);
        done();
      });
    });

  }

  describe('udp', () => {

    var dnsServer;
    var options = {
      address: '127.0.0.1',
      port: 4444,
      type: 'udp',
    };

    before((done) => {
      options.db = new FakeDNSDb();
      dnsServer = new DNSServer(options);
      dnsServer.on('listening', done);
    });

    after((done) => {
      dnsServer.close();
      done();
    });

    sharedTests(dnsServer, options);

  });

  describe('tcp', () => {

    var dnsServer;
    var options = {
      address: '127.0.0.1',
      port: 4444,
      type: 'tcp',
    };

    before((done) => {
      options.db = new FakeDNSDb();
      dnsServer = new DNSServer(options);
      dnsServer.on('listening', done);
    });

    after((done) => {
      dnsServer.close();
      done();
    });

    sharedTests(dnsServer, options);

  });


});

