#!/usr/bin/env node
const cli = require("commander");
const child = require('child_process');
const watchman = require('fb-watchman');
const fs = require('fs');
const path = require('path');
const request = require('request');
const chalk = require('chalk');
const mdns = require('mdns');

const pkgJson = require(__dirname + '/package.json');

const client = new watchman.Client();
const defaultIp = "localhost";
const defaultDAppPort = 8080;
const statusDebugServerPort = 5561;
const StatusDev = require('./index.js');

function fromAscii(str) {
    var hex = "";
    for(var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }

    return "0x" + hex;
};

function makeSubscription(client, watch, relativePath, contactData) {
    sub = {
        expression: ["allof", ["match", "*.*"]],
        fields: ["name"]
    };
    if (relativePath) {
        sub.relative_root = relativePath;
    }

    client.command(['subscribe', watch, 'contact-subscription', sub],
        function (error, resp) {
            if (error) {
                console.error('Failed to subscribe: ', error);
                return;
            }
            console.log('Subscription established');
        }
    );

    client.on('subscription', function (resp) {
        if (resp.subscription !== 'contact-subscription') return;

        resp.files.forEach(function (file) {
            //console.log('File changed: ' + file);
        });

        url = "http://" + (cli.ip || defaultIp) + ":5561/dapp-changed";
        child.execSync("curl -X POST -H \"Content-Type: application/json\" -d '{\"encoded\": \"" + fromAscii(contactData) + "\"}' " + url);

        request({
            url: "http://" + (cli.ip || defaultIp) + ":5561/dapp-changed",
            method: "POST",
            json: true,
            body: { encoded: fromAscii(contactData) }
        }, function (error, response, body) {
            if (error) {
                printMan();
            }
        });
    });
}

function getCurrentPackageData() {
    var obj = {};
    if (fs.existsSync(process.cwd() + '/package.json')) {
        var json = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8'));
        obj["name"] = json.name;
        obj["whisper-identity"] = "dapp-" + fromAscii(json.name);
	    if(json["dapp-url"])
	    	obj["dapp-url"] = json["dapp-url"];
	    if(json["bot-url"])
	    	obj["bot-url"] = json["bot-url"];
	    if(!json["dapp-url"] && !json["bot-url"])
		console.error(chalk.red("Neither 'dapp-url' nor 'bot-url' where provided in package.json"));
    }
    return obj;
}
function getPackageData(contact) {
    var contactData;
    if (!contact) {
        contactData = JSON.stringify(getCurrentPackageData());
    } else {
        contactData = contact;
    }
    return contactData;
}

function printMan() {
    console.error(chalk.red("Cannot connect to Status."));
    console.log("1. Please, ensure that your device is connected to your computer;");
    console.log("2. If it is connected, ensure that you're logged in and the debug mode is enabled;");
    console.log("3. If you use Android, you should also execute " +
        chalk.yellow("adb forward tcp:5561 tcp:5561") + " before using development tools.")
    console.log();
    console.log("Check our docs for more information:");
    console.log("http://docs.status.im/");
}

function printServerProblem() {
    console.log("Server doesn't respond properly.");
    console.log("Please, re-run it or re-login to your account.");
    console.log();
    console.log("Check our docs for more information:");
    console.log("http://docs.status.im/");
}

cli.command("add [contact]")
    .description("Adds a contact")
    .action(function (contact) {
        var statusDev = new StatusDev({ip: cli.ip || defaultIp});
        var contactData = getPackageData(contact);
        if (contactData) {
            statusDev.addContact(contactData, function(err, body) {
                if (err) {
                    printMan();
                } else if (body.type == "error") {
                    console.log(chalk.red(body.text));
                } else {
                    console.log(chalk.green(body.text));
                }
            });
        }
    });

cli.command("remove [contact]")
    .description("Removes a contact")
    .action(function (contact) {
        var statusDev = new StatusDev({ip: cli.ip || defaultIp});
        var contactData = getPackageData(contact);
        if (contactData) {
            statusDev.removeContact(contactData, function(err, body) {
                if (err) {
                    printMan();
                } else if (body.type == "error") {
                    console.log(chalk.red(body.text));
                } else {
                    console.log(chalk.green(body.text));
                }
            });
        }
    });

cli.command("refresh [contact]")
    .description("Refreshes a debuggable contact")
    .action(function (contact) {
        var statusDev = new StatusDev({ip: cli.ip || defaultIp});
        var contactData = getPackageData(contact);
        if (contactData) {
            statusDev.refreshContact(contactData, function(err, body) {
                if (err) {
                    printMan();
                } else if (body.type == "error") {
                    console.log(chalk.red(body.text));
                } else {
                    console.log(chalk.green(body.text));
                }
            });
        }
    });

cli.command("switch-node <url>")
    .description("Switches the current RPC node")
    .action(function (url) {
        var statusDev = new StatusDev({ip: cli.ip || defaultIp});
        statusDev.switchNode(url, function(err, body) {
            if (err) {
                printMan();
            } else if (body.type == "error") {
                console.log(chalk.red(body.text));
            } else {
                console.log(chalk.green(body.text));
            }
        });
    });

cli.command("list")
    .description("Displays all debuggable DApps and bots")
    .action(function () {
        var statusDev = new StatusDev({ip: cli.ip || defaultIp});
        statusDev.listDApps(function (err, body) {
            if (err) {
                printMan();
            } else if (body === undefined) {
                printServerProblem();
            } else if (body.data === undefined) {
                console.log(chalk.red("No DApps or bots."));
            } else {
                body.data.forEach(function(item, i, arr) {
                    if (item["dapp-url"]) {
                        console.log(chalk.green(chalk.bold(item["whisper-identity"]) +
                            " (Name: \"" + item.name + "\", DApp URL: \"" + item["dapp-url"] + "\")"));
                    } else if (item["bot-url"]) {
                        console.log(chalk.cyan(chalk.bold(item["whisper-identity"]) +
                            " (Name: \"" + item.name + "\", Bot URL: \"" + item["bot-url"] + "\")"));
                    }
                });
            }
        });
    });

cli.command("log <identity>")
    .description("Returns log for a specified DApp or bot")
    .action(function (identity) {
        var statusDev = new StatusDev({ip: cli.ip || defaultIp});
        statusDev.getLog(identity, function (err, body) {
            if (err) {
                printMan();
            } else if (body === undefined) {
                printServerProblem();
            } else if (body.type == "error") {
                console.log(chalk.red(body.text));
            } else {
                body.data.forEach(function(item, i, arr) {
                    var time = new Date(item.timestamp).toLocaleString();

                    if (item.content.startsWith("error:")) {
                        console.log(chalk.red(time + " " + item.content));
                    } else if (item.content.startsWith("warn:")) {
                        console.log(chalk.cyan(time + " " + item.content));
                    } else {
                        console.log(time + " " + item.content);
                    }
                });
            }
        });
    });

cli.command("scan")
    .description("Scans your network and searches for Status debug servers")
    .action(function () {
        console.log("Searching for connected devices...");

        var browser = mdns.createBrowser(mdns.tcp('http'));
        browser.on('serviceUp', function(service) {
            if (service.port == statusDebugServerPort) {
                console.log(chalk.green(chalk.bold(service.name) + " (" + service.addresses.join(", ") + ")"));
            }
        });
        browser.start();
    });

cli.command("watch [dir] [contact]")
    .description("Starts watching for contact changes")
    .action(function (dir, contact) {
        var contactData = getPackageData(contact);
        if (!contactData) {
            return;
        }
        contactDir = dir || process.cwd();
        if (fs.existsSync(contactDir + '/build/')) {
            contactDir += '/build';
        }
        console.log("Watching for changes in " + contactDir);

        client.capabilityCheck(
            {optional:[], required:['relative_root']},
            function (error, resp) {
                if (error) {
                    console.log(error);
                    client.end();
                    return;
                }

                client.command(
                    ['watch-project', contactDir],
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
                            contactData
                        );
                    }
                );
            }
        );
    });

cli.on("*", function(command) {
    console.error("Unknown command " + command[0] + ". See --help for valid commands.")
});


cli.version(pkgJson.version)
    .option("--ip [ip]", "IP address of your device")
    .option("--dapp-port [dappPort]", "Port of your local DApp server")
    .parse(process.argv);
