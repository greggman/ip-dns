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
const fs = require('fs');

var g_suffix
// v0_base64Json.phat-dns.com
var g_parseUrlRE = new RegExp('^v(\\d+)_([^\\.]+)\\.' + g_suffix.replace(/\./g, '\\.') + '$');

/**
 * Does it matter that JSON is order independent?
 * It seems like
 *
 * @typedef {Object} IPInfo
 * @property {string} id the id
 * @property {string} [i4] ip4 address
 * @property {string} [i6] ip6 address
 * --
 * @property {string} [x4] external ip4 address
 * @property {string} [x6] external ip6 address
 */

/**
 * @typedef {Object} NameInfo
 * @property {number} version
 * @property {IPInfo} the ip info
 */

/**
 * Parses a url
 * @param {string} name the name from a question
 * @return {NameInfo} the name info or undefined if could not parse
 */
function parseName(name) {
  var m = parseUrlRE.exec(name);
  if (m) {
    try {
      var buf = new Buffer(m[2], 'base64');
      var data = JSON.parse(buf.toString());
    } catch (e) {
      console.error("bad url:", name);
    }
    return {
      version: parseInt(m[1]),
      data: data;
    }
  }
}

function createName(options) {
  var version = options.version || 0;
  var data = {
    i4: options.i4Address,
    i6: options.i6Address,
  };
  return 'v' + version + '_' + JSON.stringify(data) + '.' + g_suffix;
}

var inTypeHandlers = {
  A: (dns, request, question, response) => {
    console.log("A");
    var name = question.name;
  },
  AAAA: (dns, request, question, response) => {
    console.log("AAAA");
  },
  TXT: (dns, request, question, response) => {
    console.log("TXT");
  },
};

var classHandlers = {
  IN: (dns, typeStr, request, response) => {
    console.log("IN");
    var handler = inTypeHandlers[typeStr];
    if (!handler) {
      console.log("no handler for type:", typeStr);
      return
    }
    handler(dns, request, response);
  },
  ANY: () => {
  },
};


// This DNS server just servers the same ip address for all domains.
// options:
//   address: ip address to report
class DNSServer {
  constructor (options) {
    this.options = options || { };

    if (process.platform === 'darwin') {
      this._checkForEtcResolvConf();
    } else {
      this._start();
    }
  }

  _start() {
    var options = this.options;
    for (var key in dns) {
      console.log("dns.", key);
    }
    for (var key in dns.consts) {
      console.log("dns.consts.", key);
    }
    var server = dns.createServer();

    var port = options.port || 53;

    var address = options.address || '0.0.0.0';

    server.on('request', function (request, response) {
      //debug("response: " + address + " : " + request.question[0].name);
      request.question.forEach((q, ndx) => {
        var classStr = dns.consts.QCLASS_TO_NAME[q.class];
        var typeStr = dns.consts.QTYPE_TO_NAME[q.type];

        debug("q:", ndx,
            "type:", dns.consts.QTYPE_TO_NAME[q.type],
            "class:", dns.consts.QCLASS_TO_NAME[q.class],
            JSON.stringify(q));

        var classHandler = classHandlers[classStr];
        if (!classHandler) {
          console.error("no handler for class:", classStr);
          return;
        }
        classHandler(dns, typeStr, request, q, response);
      });
      response.answer.push(dns.A({    // eslint-disable-line
        name: request.question[0].name,
        address: address,
        ttl: 1,
      }));
      response.send();
    });

    server.on('socketError', function (err, socket) {
      console.error(err);
    });

    server.on('error', function (err, msg, response) {
      console.error(err, msg);
    });

    server.on('listening', function () {
      console.log("serving dns to: " + address + ":" + port);
    });

    try {
      server.serve(port);
    } catch (e) {
      console.error(e);
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
    console.log("waiting for /etc/resolv.conf");
    setTimeout(() => { this._checkForEtcResolvConf(); }, 2000);
  };

};

module.exports = DNSServer;
