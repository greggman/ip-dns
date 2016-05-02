/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
"use strict";

const debug = require('debug')('ip-dns');
const dns = require('native-dns');
const EventEmitter = require('events').EventEmitter;
const fs = require('fs');
const DNSDb = require('./dns-db');

var log = console.log.bind(console);  // eslint-disable-line
var error = console.error.bind(console);  // eslint-disable-line
var warn = console.warn.bind(console);  // eslint-disable-line
var ttl = 1;

var dnsdb = new DNSDb();

var split255RE = /(.{1,255})/g;

var inTypeHandlers = {
  A: (question, response /* , dns, request*/) => {
    debug("-> A");
    return dnsdb.get(question.name, 'A')
    .then((dnsRecord) => {
      response.answer.push(dns.A({
        name: question.name,
        address: dnsRecord.content,
        ttl: 1,
      }));
    });
  },
  AAAA: (question, response /* dns, request */) => {
    debug("-> AAAA");
    return dnsdb.get(question.name, 'AAAA')
    .then((dnsRecord) => {
      response.answer.push(dns.AAAA({
        name: question.name,
        address: dnsRecord.content,
        ttl: 1,
      }));
    });
  },
  TXT: (question, response /* dns, request */) => {
    debug("-> TXT");
    return dnsdb.get(question.name, 'TXT')
    .then((dnsRecord) => {
      var parts = dnsRecord.content.match(split255RE);
      parts.forEach((part) => {
        response.answer.push(dns.TXT({
          name: question.name,
          data: [part],
          ttl: 1,
        }));
      });
    });
  },
};

var classHandlers = {
  IN: (q, response, dns, typeStr, request) => {
    debug("-> IN");
    var handler = inTypeHandlers[typeStr];
    if (!handler) {
      warn("no handler for type:", typeStr);
      return;
    }
    handler(q, response, dns, request);
  },
  ANY: () => {
  },
};

// options:
//   address: ip address listen on: default 127.0.0.1
//   port: port to listen on. defaut: 53
class DNSServer extends EventEmitter {
  constructor(options) {
    super();
    this.options = options || { };

    if (process.platform === 'darwin') {
      this._checkForEtcResolvConf();
    } else {
      this._start();
    }
  }

  _start() {
    // force at least 1 tick so events don't get emitted
    // before users have a chance to listen for them
    process.nextTick(() => { this._init(); });
  }

  _init() {
    var options = this.options;
    //for (let key in dns) {
    //  log("dns.", key);
    //}
    //for (let key in dns.consts) {
    //  log("dns.consts.", key);
    //}
    var server = options.tcp ? dns.createTCPServer() : dns.createUDPServer();

    var port = options.port || 53;
    var address = options.address || '127.0.0.1';

    server.on('request', (request, response) => {
      //debug("response: " + address + " : " + request.question[0].name);
      var tasks = request.question.map((q, ndx) => {
        var classStr = dns.consts.QCLASS_TO_NAME[q.class];
        var typeStr = dns.consts.QTYPE_TO_NAME[q.type];

        debug("q:", ndx,
            "type:", dns.consts.QTYPE_TO_NAME[q.type],
            "class:", dns.consts.QCLASS_TO_NAME[q.class],
            JSON.stringify(q));

        var classHandler = classHandlers[classStr];
        if (!classHandler) {
          error("no handler for class:", classStr);
          return Promise.reject("no handler for class:" + classStr);
        }
        return classHandler(q, response, dns, typeStr, request);
      });
      Promise.all(tasks)
      .then(() => {
        debug("<- SEND num answers:", response.answer.length);
        response.send();
      })
      .catch((e) => {
        error(e);
      });
    });

    server.on('socketError', (err /*, socket */) => {
      error(err);
      this.emit('error', err);
    });

    server.on('error', (err, msg /* , response */) => {
      error(err, msg);
      this.emit('error', err, msg);
    });

    server.on('listening', () => {
      this.emit('listening');
    });

    try {
      server.serve(port, address);
    } catch (e) {
      error(e);
      if (e.stack) {
        error(e.stack);
      }
      this.emit('error', err, msg);
    }
  }

   // Wait for /etc/resolv.conf to exist
  // Apparently this file is written by the OS but, at least with my own router,
  // it can take a 10-30 seconds until it's written. It's probably some kind of timeout.
  _checkForEtcResolvConf() {
    if (fs.existsSync("/etc/resolv.conf")) {
      this._start();
      return;
    }
    log("waiting for /etc/resolv.conf");
    setTimeout(() => {
      this._checkForEtcResolvConf();
    }, 2000);
  }

}

module.exports = DNSServer;
