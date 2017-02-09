# Status CLI

Additional tools for DApps developers. These tools allows to speed up the process of developing DApps for Status.

`status-dev-cli` is included in Status bundle, and all these commands can be executed directly from `status-react` directory. 
However, `status-dev-cli` is a standalone tool and you can install it without Status.

## Requirements

1. adb (from Android SDK);
2. curl;
3. Node.js;
4. NPM;
5. Watchman (https://facebook.github.io/watchman/docs/install.html).

## Installing standalone

```
git clone https://github.com/status-im/status-dev-cli.git
cd status-dev-cli
npm i -g
```

## How to

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

1. Add a DApp to Status by executing `./status-dev-cli add-dapp localhost '{"whisper-identity": "dapp-test", "dapp-url": "http://localhost:8080/", "name": "My Dapp"}'`;
2. Open the "My Dapp" on your device;
3. Optional: Execute `./status-dev-cli watch-dapp localhost "dapp-test" ~/Documents/Dev/MyDapp` to start automatically refreshing your DApp in Status browser when you change the DApp's code.

## API

### Adding DApp

`./status-dev-cli add-dapp <ip> <dapp>`

* `ip` — device IP address;
* `dapp` — JSON containing DApp information. Required fields are `name`, `dapp-url` and `whisper-identity`. 

Example:

```
./status-dev-cli add-dapp \
     localhost \
     '{"name": "Test dapp", "whisper-identity": "dapp-test", "dapp-url": "http://localhost:1234"}'
```

### Removing DApp

`./status-dev-cli remove-dapp <ip> <dapp_identity>`

* `ip` — device IP address;
* `dapp_identity` — `whisper-identity` of your DApp. 

Example:

```
./status-dev-cli remove-dapp localhost "dapp-test"
```

### Watching for DApp changes and refreshing DApp automatically

`./status-dev-cli watch-dapp <ip> <dapp_identity> <dapp_dir>`

* `ip` — device IP address;
* `dapp_identity` — `whisper-identity` of your DApp;
* `dapp_dir` — dir that should be observed.

Example:

```
./status-dev-cli watch-dapp localhost "dapp-test" ~/Documents/DApps/dapp-test/
```
