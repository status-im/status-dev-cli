# Status CLI

Additional tools for DApps developers. These tools allows to speed up the process of developing DApps for Status.

`status-dev-cli` is included in Status bundle, and all these commands can be executed directly from `status-react` directory. However, `status-dev-cli` is a standalone tool and you can install it without Status.

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

## Features

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
