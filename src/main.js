"use strict";

const DNSServer = require('./ip-dns');
const fs = require('fs');
const path = require('path');

var mongodbPrebuilt;
var start = (callback) => {
  process.nextTick(callback);
};

try {
  mongodbPrebuilt = require('mongodb-prebuilt');
} catch (e) {
  console.log("--use real db--");
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

start(function(err) {
  if (err) {
    console.error("could not start mongo:", err);
    process.exitCode = 1;
  } else {
    startDNSServer();
  }
});

function reportListening(options) {
  console.log(options.tcp ? "tcp" : "udp", "listening on:", options.address, options.port);
}

function startDNSServer() {
  console.log("--start dns server");
  var udpOptions = {
    address: "0.0.0.0",
    port: 4444,
  };
  let udpDnsServer = new DNSServer(udpOptions);
  udpDnsServer.on('listening', () => {
    reportListening(udpOptions);
  });
  let tcpOptions = {
    address: "0.0.0.0",
    port: 4444,
    tcp: true,
  }
  let tcpDnsServer = new DNSServer(tcpOptions);
  tcpDnsServer.on('listening', () => {
    reportListening(tcpOptions);
  });
}


