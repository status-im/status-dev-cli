#!/usr/bin/env node
const cli = require("commander");
const child = require('child_process');
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
        child.execSync("curl -X POST -H \"Content-Type: application/json\" -d '{\"encoded\": \"" + contactData + "\"}' " + url);

        request({
            url: "http://" + (cli.ip || defaultIp) + ":5561/dapp-changed",
            method: "POST",
            json: true,
            body: { encoded: contactData }
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
    console.log("2. If it is connected, ensure that you're logged in and the debug mode is enabled.");
    console.log();
    console.log("Check our guide for more information:");
    console.log("https://github.com/status-im/status-dev-cli/blob/master/README.md");
}

cli.command("add [contact]")
    .description("Adds a contact")
    .action(function (contact) {
      var statusDev = new StatusDev({ip: cli.ip || defaultIp});
      var contactData = getPackageData(contact);
      if (contactData) {
        statusDev.addContact(contactData, function(err, result) {
          if (err) {
            printMan();
          } else {
            console.log(chalk.green("Contact has been added succesfully."));
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
        statusDev.removeContact(contactData, function(err, result) {
          if (err) {
            printMan();
          } else {
            console.log(chalk.green("Contact has been removed succesfully."));
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
      statusDev.refreshContact(contactData, function(err, result) {
        if (err) {
          printMan();
        } else {
          console.log(chalk.green("Contact has been refreshed succesfully."));
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
                            encodeObject(contactData)
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

