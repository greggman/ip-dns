'use strict';

const crypto = require('crypto');
const isValid = require('./is-valid');
const base32 = require('rfc-3548-b32');
const NameGen = require('./name-gen');

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


class NameParser {
  constructor(suffix) {
    this._suffix = suffix;
    // v0<i|x>dpadbase32.phat-dns.com
    var reStr = '^v(\\d+)([ix])([A-Z0-9d]{56})\\.' + suffix.replace(/\./g, '\\.') + '$';
    this._parseUrlRE = new RegExp(reStr);
    this._dRE = /d/g;
    this._nameGen = new NameGen();
  }

  /**
   * Parses a url
   * @param {string} url the url/name from a question
   * @return {NameInfo} the name info or undefined if could not parse
   */
  parse(url) {
    var m = this._parseUrlRE.exec(url);
    if (!m) {
      throw "bad url format: " + url;
    }

    return {
      version: parseInt(m[1]),
      external: m[2] === 'x',
      id: m[3],
    }
  }

  gen(options) {
    var name = this._nameGen.gen(options);
    var version = options.version || '0';
    var external = options.external || false;
    return 'v'
      + version.toString()
      + (external ? 'x' : 'i')
      + name
      + '.'
      + this._suffix;
  }
}

module.exports = NameParser;

