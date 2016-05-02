"use strict";

class DNSDb {
  constructor() {
  }

  get(name, type) {
    switch (type) {
      case 'A':
        return Promise.resolve({content: '1.2.3.4'});
      case 'AAAA':
        return Promise.resolve({content: '1234::5678'});
      case 'TXT':
        return Promise.resolve({content: 'v=DKIM1\; k=rsa\; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCNiFqnTqxcAK4MWy7bIFkeHpwQr3OO1iGxOvBBcQesE1Uns+QN3tU4/sGVlPyc38kU2BJ9snEo9YFvwSZYqI0J22FanwXxuSgZCzdB0QQmdILbwy1BCDLlTSWa8AZnwch0HauEEgTO8mZm0CweSQO3zkT46GWn9J4V778CFDEwzwIDAQAB'});
      default:
        return Promise.reject("unknown type:" + type);
    }
  }
}

module.exports = DNSDb;
