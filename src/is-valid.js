'use strict';

var g_ip4RE = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
var g_hexRE = /^[A-Fa-f0-9]*$/;

function isValidIp4Address(ip4) {
  var m = g_ip4RE.exec(ip4);
  if (m && m.length === 5) {
    for (var i = 1; i < 5; ++i) {
      if (parseInt(m[i]) > 255) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function isHex(hex) {
  return g_hexRE.test(hex);
}

function isValidIp6Address(ip6) {
  // this needs to be better
  var parts = ip6.split(':');
  if (parts.length > 8 || parts.length < 3) {
    return false;
  }
  var numEmpty = 0;
  var numNumbers = 0;
  var len = parts.length;
  for (var i = 0; i < len; ++i) {
    var part = parts[i];
    if (part.length > 4 || !isHex(part)) {
      return false;
    }
    if (part.length > 0) {
      ++numNumbers;
    }
    if (part.length === 0 && i > 0 && i < len - 1) {
      ++numEmpty;
    }
  }
  return numNumbers > 0 && (numEmpty === 1 || parts.length === 8);
}

function isValidSha256(sha256) {
  return sha256.length === 64 && isHex(sha256);
}

module.exports = {
  ip4Address: isValidIp4Address,
  ip6Address: isValidIp6Address,
  sha256: isValidSha256,
  hex: isHex,
};

