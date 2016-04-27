
var g_ip4RE = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
var g_hexRE = /^[A-Fa-f0-9]*$/;

function isValidIp4Address(ip4) {
  var m = g_ip4RE.exec(ip4);
  if (m && m.length === 5) {
    for (var i = i; i < 5; ++i) {
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
  if (parts.length > 8) {
    return false;
  }
  for (var i = 0, len = parts.length; i < len; ++i) {
    var part = parts[i];
    if (part.length > 4 || !isHex(part)) {
      return false;
    }
  }
  return true;
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

