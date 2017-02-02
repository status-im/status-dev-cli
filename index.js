#!/usr/bin/env node
const cli = require("commander")
const child = require('child_process')
const pkgJson = require(__dirname + '/package.json');

const devtoolsPath = __dirname + '/devtools.js';

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

cli.command("add-dapp <attach_to> <public_key> <dapp>")
    .description("Adds a DApp to contacts and chats")
    .action(function (attachTo, publicKey, dapp) {
        dapp = fromAscii(dapp);
        child.execSync(
            "geth --exec '" +
            "loadScript(\"" + devtoolsPath + "\");" +
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
            "loadScript(\"" + devtoolsPath + "\");" +
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