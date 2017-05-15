# Status CLI

Additional tools for DApps developers. These tools allows to speed up the process of developing DApps for Status.

## Requirements

1. adb (from Android SDK);
2. Node.js;
3. NPM;
4. Watchman (https://facebook.github.io/watchman/docs/install.html).

## Installing

```
npm i -g status-dev-cli
```

## Command Line

**Common additional parameters:**

* `--ip <device-ip>` to specify your device's IP address.

#### 1. Adding a contact (DApp or bot)

`status-dev-cli add [contact]`

* `contact` — JSON containing contact information. It is not required if you develop a DApp and this DApp contains `package.json` file. Otherwise, this map should contain `whisper-identity`, `name` and `dapp-url` or `bot-url` fields (see the example in **Scenario** section)

You can additionally specify `--dapp-port <port>` if your DApp uses port other than 8080 and you don't specify a `dapp`JSON.

#### 2. Removing a contact (DApp or bot)

`status-dev-cli remove [contact]`

* `dapp` — JSON containing `whisper-identity` field. It is not required if you develop a DApp and this DApp contains `package.json` file. 

#### 3. Refreshing a DApp automatically

`status-dev-cli watch [dir] [contact]`

* `dir` — dir that should be observed. Not required;
* `contact` — JSON containing `whisper-identity` field. It is not required if you develop a DApp and this DApp contains `package.json` file. 

#### 4. Refreshing a DApp manually

***Requires status-dev-cli 2.2.1+!***

This command simply reloads the DApp

`status-dev-cli refresh [dapp]`

* `dapp` — JSON containing `whisper-identity` field. It is not required if your DApp contains `package.json` file.

#### 5. Switching network

***Requires Status 0.9.4+ & status-dev-cli 2.2.0+!***

Typically when developing DApps, a developer uses his own private chain or a simulator.
Status inserts its own web3 object into the DApp, however, this web3 object is connected to a different network than the development one.
This command allows to switch a network. Next time you login the network will be switched back.

`status-dev-cli switch-node <url>`

* `url` (required) — the network that will be used instead of `http://localhost:8545`

## Library

```
  var StatusDev = require('status-dev-cli');
  var statusDev = new StatusDev({ip: 'you-device-ip'});
```

#### dappData

```
  dataData = {
    "whisper-identity": "dapp-MyAppName",
    "dapp-url": "http://your-server-ip:port",
    "name": "My App Name"
  }
```

#### 1. Adding a DApp

```
  statusDev.addDapp(dappData, function(error, result) {});
```

#### 2. Refreshing a DApp

```
  statusDev.refreshDapp(dappData, function(error, result) {});
```

#### 3. Removing a DApp

```
  statusDev.removeDapp(dappData, function(error, result) {});
```

#### 4. Switching network

```
  statusDev.switchNode(rpcUrl, function(error, result) {});
```

## DApp development

To make debugging work we run a web server on your device. It runs on port 5561 on both iOS and Android, but only if you need it.

To start a server you need to:
1. Connect your device to computer;
2. In the case you're developing for Android, you need to use a port forwarding.
   Execute `adb forward tcp:5561 tcp:5561`;
3. Open Status application and log in;
4. Open `Console` chat and execute `/debug` command providing "On" as the argument.

You can also easily turn the server off from here.

**Note:** if you turn the server on, it will start automatically the next time you log in.

### Scenario

Imagine you are developing a DApp on your computer. You have a directory where all DApp files are placed, 
and there is a server running on your computer. Let's say it is running on port 8080, so you can access 
your DApp by typing http://localhost:8080 in your browser.

1. Add a DApp to Status by executing `status-dev-cli add '{"whisper-identity": "dapp-test", "dapp-url": "http://localhost:8080/", "name": "My Dapp"}'`;
2. Open the "My Dapp" on your device;
3. Optional: Execute `status-dev-cli watch-dapp . '{"whisper-identity": "dapp-test"}'` to start automatically refreshing your DApp in Status browser when you change the DApp's code.
