#!/usr/bin/env node
const cli = require("commander")
const child = require('child_process')
const watchman = require('fb-watchman');

const pkgJson = require(__dirname + '/package.json');
const devtoolsPath = __dirname + '/devtools.js';

var client = new watchman.Client();

function fromAscii(str) {
    var hex = "";
    for(var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }

    return "0x" + hex;
};

function makeSubscription(client, watch, relativePath, attachTo, publicKey, dapp) {
    sub = {
        expression: ["allof", ["match", "*.*"]],
        fields: ["name"]
    };
    if (relativePath) {
        sub.relative_root = relativePath;
    }

    client.command(['subscribe', watch, 'dapp-subscription', sub],
        function (error, resp) {
            if (error) {
                console.error('Failed to subscribe: ', error);
                return;
            }
            console.log('Subscription established');
        }
    );

    client.on('subscription', function (resp) {
        if (resp.subscription !== 'dapp-subscription') return;

        resp.files.forEach(function (file) {
            console.log('File changed: ' + file);
        });

        child.execSync(
            "geth --exec '" +
            "loadScript(\"" + devtoolsPath + "\");" +
            "status.notifyDAppChanged(\"" + publicKey + "\", \"" + dapp + "\");'" +
            " " +
            "attach " + attachTo
        );
    });
}

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
    .description("Removes a debuggable DApp")
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

cli.command("watch-dapp <attach_to> <public_key> <dapp_identity> <dapp_dir>")
    .description("Starts watching for DApp changes")
    .action(function (attachTo, publicKey, dappIdentity, dappDir) {
        dapp = fromAscii(JSON.stringify({"whisper-identity": dappIdentity}));

        client.capabilityCheck(
            {optional:[], required:['relative_root']},
            function (error, resp) {
                if (error) {
                    console.log(error);
                    client.end();
                    return;
                }

                client.command(
                    ['watch-project', dappDir],
                    function (error, resp) {
                        if (error) {
                            console.error('Error initiating watch:', error);
                            return;
                        }

                        if ('warning' in resp) {
                            console.log('Warning: ', resp.warning);
                        }

                        makeSubscription(
                            client,
                            resp.watch,
                            resp.relative_path,
                            attachTo,
                            publicKey,
                            dapp
                        );
                    }
                );
            }
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
