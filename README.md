# Status CLI

Additional tools for DApps developers. These tools allows to speed up the process of developing DApps for Status.

`status-dev-cli` is included in Status bundle, and all these commands can be executed directly from `status-react` directory. However, `status-dev-cli` is a standalone tool and you can install it without Status.

## Requirements

1. Geth (https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum);
2. Node.js;
3. NPM;
4. Watchman (https://facebook.github.io/watchman/docs/install.html).

## Installing standalone

```
git clone https://github.com/status-im/status-dev-cli.git
cd status-dev-cli
npm i -g
```

## Features

### Adding DApp

`./status-dev-cli add-dapp <attach_to> <public_key> <dapp>`

* `attach_to` — Geth endpoint;
* `public_key` — Public key of your user (you can find it in your profile);
* `dapp` — JSON containing DApp information. Required fields are `name`, `dapp-url` and `whisper-identity`. 

Example:

```
./status-dev-cli add-dapp \
     http://localhost:8545 \
     "0x04..." \
     '{"name": "Test dapp", "whisper-identity": "dapp-test", "dapp-url": "http://localhost:1234"}'
```

### Removing DApp

`./status-dev-cli remove-dapp <attach_to> <public_key> <dapp_identity>`

* `attach_to` — Geth endpoint;
* `public_key` — Public key of your user (you can find it in your profile);
* `dapp_identity` — `whisper-identity` of your DApp. 

Example:

```
./status-dev-cli remove-dapp http://localhost:8545 "0x04..." "dapp-test"
```

### Watching for DApp changes and updating it automatically

`./status-dev-cli watch-dapp <attach_to> <public_key> <dapp_identity> <dapp_dir>`

* `attach_to` — Geth endpoint;
* `public_key` — Public key of your user (you can find it in your profile);
* `dapp_identity` — `whisper-identity` of your DApp;
* `dapp_dir` — dir that should be observed.

Example:

```
./status-dev-cli watch-dapp http://localhost:8545 "0x04..." "dapp-test" ~/Documents/DApps/dapp-test/
```


