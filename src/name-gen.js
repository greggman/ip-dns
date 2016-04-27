'use strict';

const crypto = require('crypto');
const isValid = require('./is-valid');
const base32 = require('rfc-3548-b32');

const g_equalRE = /=/g;

class NameGen {
  constructor() {
  }

  gen(options) {
    if (!isValid.ip4Address(options.i4)) {
      throw "bad i4 address: " + options.i4;
    }
    if (!isValid.ip4Address(options.x4)) {
      throw "bad x4 address: " + options.x4;
    }
    if (options.i6 && !isValid.ip6Address(options.i6)) {
      throw "bad i6 address: " + options.i6;
    }
    if (options.x6 && !isValid.ip6Address(options.x6)) {
      throw "bad x6 address: " + options.x6;
    }
    if (options.id.length < 10) {
      throw "id less than 10 chars: " + options.id;
    }
    var hash = crypto.createHash('sha256');
    hash.update(options.id);
    hash.update(options.i4);
    hash.update(options.x4);
    if (options.i6) {
      hash.update(options.i6);
    }
    if (options.x6) {
      hash.update(options.x6);
    }
    var b32 = base32.encode(hash.digest());
    return b32.replace(g_equalRE, 'd');
  }
}

module.exports = NameGen;

