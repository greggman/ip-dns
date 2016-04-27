"use strict";

const DNSServer = require('./ip-dns');

let dnsServer = new DNSServer({  // eslint-disable-line
  address: "0.0.0.0",
  port: 4444,
});

