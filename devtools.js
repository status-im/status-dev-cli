var status = {
    addDApp: function(to, argsHex) {
        web3.shh.post({
            "from": to,
            "to": to,
            "topics": ["status-dapp-topic"],
            "ttl": 5,
            "payload": web3.fromAscii("{:type :debug :action :add-dapp :args \"" + argsHex + "\"}\n")
        });
        return "Request sent";
    },
    removeDApp: function(to, argsHex) {
        web3.shh.post({
            "from": to,
            "to": to,
            "topics": ["status-dapp-topic"],
            "ttl": 5,
            "payload": web3.fromAscii("{:type :debug :action :remove-dapp :args \"" + argsHex + "\"}\n")
        });
        return "Request sent";
    },
    notifyDAppChanged: function(to, argsHex) {
        web3.shh.post({
            "from": to,
            "to": to,
            "topics": ["status-dapp-topic"],
            "ttl": 2,
            "payload": web3.fromAscii("{:type :debug :action :dapp-changed :args \"" + argsHex + "\"}\n")
        });
        return "Notification sent";
    }
};

// geth --exec 'loadScript("devtools.js"); status.addDApp(contact, {"name": "DApp wow", "dapp-url": "http://google.com/", "whisper-identity": "dapp-google-wow"})' attach http://localhost:8545