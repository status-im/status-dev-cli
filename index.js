#!/usr/bin/env node
const cli = require("commander")
const child = require('child_process')
const pkgJson = require(__dirname + '/package.json');

var fromAscii = function(str) {
    var hex = "";
    for(var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }

    return "0x" + hex;
};

cli.version(pkgJson.version);

// status-dev-cli add-dapp http://localhost:8545 "0x047fdcea8e559e251211b43731acd951e1ae698e43b7e330a14881b2c6e7a34c5e3397bb8ff06109df59171b369872c36adbdb7b34667cfa71a5f7c1910b4d9097" '{"name": "DAPP", "whisper-identity": "dapp-dapp-dapp", "dapp-url": "http://google.com"}'
cli.command("add-dapp <attach_to> <public_key> <dapp>")
    .description("Adds a DApp to contacts and chats")
    .action(function (attachTo, publicKey, dapp) {
        dapp = fromAscii(dapp);
        child.execSync(
            "geth --exec '" +
            "loadScript(\"devtools.js\");" +
            "status.addDApp(\"" + publicKey + "\", \"" + dapp + "\");'" +
            " " +
            "attach " + attachTo
        );
    });

cli.command("remove-dapp <attach_to> <public_key> <dapp_identity>")
    .description("Adds a DApp to contacts and chats")
    .action(function (attachTo, publicKey, dappIdentity) {
        dapp = fromAscii(JSON.stringify({"whisper-identity": dappIdentity}));
        child.execSync(
            "geth --exec '" +
            "loadScript(\"devtools.js\");" +
            "status.removeDApp(\"" + publicKey + "\", \"" + dapp + "\");'" +
            " " +
            "attach " + attachTo
        );
    });

cli.on("*", function(command) {
    console.error("Unknown command " + command[0] + ". See --help for valid commands")
});

if (process.argv.length <= 2) {
    cli.outputHelp();
} else {
    cli.parse(process.argv);
}