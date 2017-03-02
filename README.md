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

1. Add a DApp to Status by executing `status-dev-cli add-dapp '{"whisper-identity": "dapp-test", "dapp-url": "http://localhost:8080/", "name": "My Dapp"}'`;
2. Open the "My Dapp" on your device;
3. Optional: Execute `status-dev-cli watch-dapp . '{"whisper-identity": "dapp-test"}'` to start automatically refreshing your DApp in Status browser when you change the DApp's code.

## API

You can specify a --dapp-port in the case your DApp uses port other than 8080.

### Adding DApp

`status-dev-cli add-dapp [dapp]`

* `dapp` — JSON containing DApp information. It is not required if your DApp contains `package.json` file. Otherwise, this map should contain `whisper-identity`, `dapp-url` and `name` fields (see the example in **Scenario** section)

### Removing DApp

`status-dev-cli remove-dapp [dapp]`

* `dapp` — JSON containing `whisper-identity` field. It is not required if your DApp contains `package.json` file.

### Watching for DApp changes and refreshing DApp automatically

`status-dev-cli watch-dapp [dappDir] [dapp]`

* `dapp_dir` — dir that should be observed. Not required;
* `dapp` — JSON containing `whisper-identity` field. It is not required if your DApp contains `package.json` file.
