"use strict";

const DNSServer = require('./ip-dns');
const fs = require('fs');
const path = require('path');
const DNSDb = require('./dns-db');

var log = console.log.bind(console);  // eslint-disable-line
var error = console.error.bind(console);  // eslint-disable-line

var mongodbPrebuilt;
var start = (callback) => {
  process.nextTick(callback);
};

try {
  mongodbPrebuilt = require('mongodb-prebuilt');
} catch (e) {
  log("--use real db--");
}

if (mongodbPrebuilt) {
  var dbpath = path.join(__dirname, '..', '.db');
  if (!fs.existsSync(dbpath)) {
    fs.mkdirSync(dbpath);
  }
  start = function(callback) {
    mongodbPrebuilt.start_server({
      auto_shutdown: true,  // stop mongo when we exit
      args: {
        port: 27017,
        dbpath: dbpath,
      },
    }, callback);
  };
}

function reportListening(options) {
  log(options.tcp ? "tcp" : "udp", "listening on:", options.address, options.port);
}

function startDNSServer() {
  log("--start dns server");

  var dnsdb = new DNSDb();

  var udpOptions = {
    address: "0.0.0.0",
    port: 4444,
    db: dnsdb,
  };
  let udpDnsServer = new DNSServer(udpOptions);
  udpDnsServer.on('listening', () => {
    reportListening(udpOptions);
  });
  let tcpOptions = {
    address: "0.0.0.0",
    port: 4444,
    type: 'tcp',
    db: dnsdb,
  };
  let tcpDnsServer = new DNSServer(tcpOptions);
  tcpDnsServer.on('listening', () => {
    reportListening(tcpOptions);
  });
}

start(function(err) {
  if (err) {
    error("could not start mongo:", err);
    process.exitCode = 1;
  } else {
    startDNSServer();
  }
});


