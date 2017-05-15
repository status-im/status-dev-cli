const request = require('request');

function fromAscii(str) {
    var hex = "";
    for(var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }
    return "0x" + hex;
};

function encodeObject(obj) {
  return fromAscii(JSON.stringify(obj));
}

var StatusDev = function(options) {
  this.url = "http://" + options.ip + ":5561";
};

StatusDev.prototype.addContact = function(contactData, cb) {
  request({
    url: this.url + "/add-dapp",
    method: "POST",
    json: true,
    body: { encoded: encodeObject(contactData) }
  }, function (error, response, body) {
    if (cb === undefined) { return }
    cb(error, response);
  });
};

StatusDev.prototype.removeContact = function(contactData, cb) {
  request({
    url: this.url + "/remove-dapp",
    method: "POST",
    json: true,
    body: { encoded: encodeObject(contactData) }
  }, function (error, response, body) {
    if (cb === undefined) { return }
    cb(error, response);
  });
};

StatusDev.prototype.refreshContact = function(contactData, cb) {
  request({
    url: this.url + "/dapp-changed",
    method: "POST",
    json: true,
    body: { encoded: encodeObject(contactData) }
  }, function (error, response, body) {
    if (cb === undefined) { return }
    cb(error, response);
  });
};

StatusDev.prototype.switchNode = function(rpcUrl, cb) {
  request({
    url: this.url + "/switch-node",
    method: "POST",
    json: true,
    body: {encoded: encodeObject({"url": rpcUrl})}
  }, function (error, response, body) {
    if (cb === undefined) { return }
    cb(error, response);
  });
};

module.exports = StatusDev;
