#!/usr/bin/env node
const cli = require("commander")
const child = require('child_process')
const watchman = require('fb-watchman');
const fs = require('fs');
const path = require('path');
const request = require('request');
const chalk = require('chalk');

const pkgJson = require(__dirname + '/package.json');

const client = new watchman.Client();
const defaultIp = "localhost";
const defaultDAppPort = 8080;
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

function encodeObject(obj) {
  return fromAscii(JSON.stringify(obj));
}

function makeSubscription(client, watch, relativePath, dappData) {
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
            //console.log('File changed: ' + file);
        });

        url = "http://" + (cli.ip || defaultIp) + ":5561/dapp-changed";
        child.execSync("curl -X POST -H \"Content-Type: application/json\" -d '{\"encoded\": \"" + dappData + "\"}' " + url);

        request({
            url: "http://" + (cli.ip || defaultIp) + ":5561/dapp-changed",
            method: "POST",
            json: true,
            body: { encoded: dappData }
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
        obj["dapp-url"] = "http://localhost:" + (cli.dappPort || defaultDAppPort);
    }
    return obj;
}

function getPackageData(dapp) {
    var dappData = dapp;
    if (!dapp) {
        dappData = getCurrentPackageData();
    }
    return dappData;
}

function printMan() {
    console.error(chalk.red("Cannot connect to Status."));
    console.log("1. Please, ensure that your device is connected to your computer;");
    console.log("2. If it is connected, ensure that you're logged in and the debug mode is enabled.");
    console.log();
    console.log("Check our guide for more information:");
    console.log("https://github.com/status-im/status-dev-cli/blob/master/README.md");
}

cli.command("add-dapp [dapp]")
    .description("Adds a DApp to contacts and chats")
    .action(function (dapp) {
      var statusDev = new StatusDev({ip: cli.ip || defaultIp});
      var dappData = getPackageData(dapp);
      if (dappData) {
        statusDev.addDapp(dappData, function(err, result) {
          if (err) {
            printMan();
          } else {
            console.log(chalk.green("DApp has been added succesfully."));
          }
        });
      }
    });

cli.command("remove-dapp [dapp]")
    .description("Removes a debuggable DApp")
    .action(function (dapp) {
      var statusDev = new StatusDev({ip: cli.ip || defaultIp});
      statusDev.removeDapp();
      var dappData = getPackageData(dapp);
      if (dappData) {
        statusDev.removeDapp(dappData, function(err, result) {
          if (err) {
            printMan();
          } else {
            console.log(chalk.green("DApp has been removed succesfully."));
          }
        });
      }
    });

cli.command("refresh-dapp [dapp]")
  .description("Refreshes a debuggable and currently visible DApp")
  .action(function (dapp) {
    var statusDev = new StatusDev({ip: cli.ip || defaultIp});
    var dappData = getPackageData(dapp);
    if (dappData) {
      statusDev.refreshDapp(dappData, function(err, result) {
        if (err) {
          printMan();
        } else {
          console.log(chalk.green("DApp has been refreshed succesfully."));
        }
      });
    }
  });

cli.command("switch-node <url>")
  .description("Switches the current RPC node")
  .action(function (url) {
    var statusDev = new StatusDev({ip: cli.ip || defaultIp});
    statusDev.switchNode(url, function(err, result) {
      if (err) {
        printMan();
      } else {
        console.log(chalk.green("RPC node has been changed succesfully."));
      }
    });
  });

cli.command("watch-dapp [dappDir] [dapp]")
    .description("Starts watching for DApp changes")
    .action(function (dappDir, dapp) {
        var dappData = getPackageData(dapp);
        if (!dappData) {
            return;
        }
        dappDir = dappDir || process.cwd();
        if (fs.existsSync(dappDir + '/build/')) {
            dappDir += '/build';
        }
        console.log("Watching for changes in " + dappDir);

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
                            encodeObject(dappData)
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

