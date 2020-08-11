[![NPM](https://nodei.co/npm/deccash-daemon-ha.png?downloads=true&stars=true)](https://nodei.co/npm/deccash-daemon-ha/)

# Decd High-Availability Daemon Wrapper

This project is designed to wrap the Decd daemon on a *nix system and monitor it for hangups, locks, fork, or other events that cause the daemon to stop responding to requests in an accurate manner.

The sample **service.js** includes how to automatically restart the daemon if it hangs, locks, or otherwise stops responding.

## Table of Contents

1. [To Do](#to-do)
2. [Dependencies](#dependencies)
3. [Easy Start](#easy-start)
4. [Keep it Running](#keep-it-running)
5. [Documentation](#documentation)
   1. [Methods](#methods)
   2. [Events](#events)
   3. [WebSocket Connections](#websocket-connections)

## To Do

N/A

## Dependencies

* [NodeJS v8.x](https://nodejs.org/)
* [Decd](https://github.com/deccash/deccash/releases) v0.4.1 or higher

## Easy Start

You *must* copy ```decd``` into the ```deccash-daemon-ha``` folder for the easy start process to occur.

```bash
git clone https://github.com/deccash/deccash-daemon-ha.git
cd deccash-daemon-ha
cp <decd> .
sudo npm install & npm start
```

The installation will also download the latest checkpoints. Please see [Deccash Checkpoints](http://checkpoint.deccash.com) for more information.

## Keep it Running

```bash
npm install -g pm2

pm2 startup
pm2 install pm2-logrotate

pm2 start service.js --name decd
pm2 save
```

## Updating Checkpoints

This will download the latest checkpoints to use with your node.

```bash
npm run checkpoints
```

## Documentation

### Initialization

Practically all Decd command line arguments are exposed in the constructor method. Simply include them in your list of options to get activate or use them. Default values are defined below.

```javascript
var daemon = new Decd({
  // These are our deccash-daemon-ha options
  pollingInterval: 10000, // How often to check the daemon in milliseconds
  maxPollingFailures: 3, // How many polling intervals can fail before we emit a down event?
  checkHeight: true, // Check the daemon block height against known trusted nodes
  maxDeviance: 5, // What is the maximum difference between our block height and the network height that we're willing to accept?
  clearP2pOnStart: true, // Will automatically delete the p2pstate.bin file on start if set to true
  clearDBLockFile: true, // Will automatically delete the DB LOCK file on start if set to true
  timeout: 2000, // How long to wait for RPC responses in milliseconds
  enableWebSocket: false, // Enables a socket.io websocket server on the rpcBindPort + 1
  webSocketPassword: false, // Set this to a password to use for the privileged socket events.

  // These are the standard Decd options
  path: './Decd', // Where can I find Decd?
  dataDir: '~/.Deccash', // Where do you store your blockchain?
  enableCors: false, // Enable CORS support for the domain in this value
  enableBlockExplorer: true, // Enable the block explorer
  enableBlockExplorerDetailed: false, // Enable the detailed block explorer
  loadCheckpoints: false, // If set to a path to a file, will supply that file to the daemon if it exists.
  rpcBindIp: '0.0.0.0', // What IP to bind the RPC server to
  rpcBindPort: 11898, // What Port to bind the RPC server to
  p2pBindIp: '0.0.0.0', // What IP to bind the P2P network to
  p2pBindPort: 11897, // What Port to bind the P2P network to
  p2pExternalPort: 0, // What External Port to bind the P2P network to for those behind NAT
  allowLocalIp: false, // Add our own IP to the peer list?
  peers: false, // Manually add the peer(s) to the list. Allows for a string or an Array of strings.
  priorityNodes: false, // Manually add the priority node(s) to the peer list. Allows for a string or an Array of strings.
  exclusiveNodes: false, // Only add these node(s) to the peer list. Allows for a string or an Array of strings.
  seedNode: false, // Connect to this node to get the peer list then quit. Allows for a string.
  hideMyPort: false, // Hide from the rest of the network
  dbThreads: 2, // Number of database background threads
  dbMaxOpenFiles: 100, // Number of allowed open files for the DB
  dbWriteBufferSize: 256, // Size of the DB write buffer in MB
  dbReadBufferSize: 10, // Size of the DB read cache in MB
  dbCompression: false, // enable rocksdb compression
  feeAddress: false, // allows to specify the fee address for the node
  feeAmount: 0 // allows to specify the fee amount for the node
})
```

## Methods

### daemon.api.start()

Starts up the daemon and starts monitoring the process.

```javascript
daemon.start()
```

### daemon.api.stop()

Stops the daemon and halts all monitoring processes.

```javascript
daemon.stop()
```

### daemon.api.write(text)

Allows you to send a line of text to the daemon console

```javascript
daemon.write('help')
```

## Events

### Event - *block*

This is emitted whenever a new block is found on the network (or locally).

```javascript
daemon.on('block', (blockInfo) => {
  // do something
})
```

#### Sample data

```javascript
{
  major_version: 4,
  minor_version: 0,
  timestamp: 1590887005,
  prev_hash: '1af37ba559f94a6629153bb7fd24e8e857ec192a03af6ce0c23195d2dd8209b3',
  nonce: 285623,
  orphan_status: false,
  height: 360489,
  depth: 0,
  hash: 'a062a76916107596207eb8023a09c8ae6eda3b82765f19ce3bed5df6cac2487b',
  difficulty: 1254680,
  reward: 2948385,
  blockSize: 971,
  transactionsCumulativeSize: 343,
  alreadyGeneratedCoins: '1068614992054',
  alreadyGeneratedTransactions: 418224,
  sizeMedian: 343,
  baseReward: 2948385,
  penalty: 0,
  effectiveSizeMedian: 100000,
  transactions: [
    {
      hash: '22dd55ac0ab270976438ceb5cc17620dffa45761b683327837bb27824c29e425',
      fee: 0,
      amount_out: 2948385,
      size: 343
    }
  ],
  totalFeeAmount: 0
}
```

### Event - *data*

Feeds back the *stdout* of the daemon process on a line by line basis. You can use this to monitor the progress of the application or hook and do your own development.

```javascript
daemon.on('data', (data) => {
  // do something
})
```

### Event - *desync*

This event is emitted when the daemon has lost synchronization with the Deccash network

```javascript
daemon.on('descync', (daemonHeight, networkHeight, deviance) => {
  // do something
})
```

### Event - *down*

This event is emitted when the daemon is not responding to RPC requests or local console checks. We believe at that point that the daemon is hung.

```javascript
daemon.on('down', () => {
  // do something
})
```

### Event - *error*

This event is emitted when the daemon or our service encounters an error.

```javascript
daemon.on('error', (err) => {
  // do something
})
```

### Event - *info*

This event is emitted when the daemon or our service has something to tell you but its not that important.

```javascript
daemon.on('info', (info) => {
  // do something
})
```

### Event - *ready*

This event is emitted when the daemon is synchronized with the Deccash network and is passing all the checks we have for it. It returns the equivalent of a */getinfo* call to the RPC server with a few minor additions.

```javascript
daemon.on('ready', (info) => {
  // do something
})
```

#### Sample Data

```javascript
{
  height: 360496,
  difficulty: 858595,
  tx_count: 57734,
  tx_pool_size: 0,
  alt_blocks_count: 0,
  outgoing_connections_count: 8,
  incoming_connections_count: 3,
  white_peerlist_size: 8,
  grey_peerlist_size: 38,
  last_known_block_index: 360494,
  network_height: 360496,
  supported_height: 1000000,
  hashrate: 28619,
  synced: true,
  major_version: 4,
  minor_version: 0,
  version: '0.4.1',
  status: 'OK',
  start_time: 1590887292,
  globalHashRate: 28620
}
```

### Event - *start*

This event is emitted when the daemon starts. The callback contains the command line arguments supplied to Decd.

```javascript
daemon.on('start', (executablePath, args) => {
  // do something
})
```

### Event - *started*

This event is emitted when the daemon is now accepting P2P connections.

```javascript
daemon.on('started', () => {
  // do something
})
```

### Event - *stopped*

This event is emitted when the daemon is stopped for whatever reason.

```javascript
daemon.on('stopped', () => {
  // do something
})
```

### Event - *synced*

This event is emitted when the daemon has synchronized with the Deccash network.

```javascript
daemon.on('synced', () => {
  // do something
})
```

### Event - *syncing*

This event is emitted when the daemon is syncing. It gives the current status of the sync.

```javascript
daemon.on('syncing', (height, networkHeight, percent) => {
  // do something
})
```

### Event - *topblock*

This event is emitted when the daemon detects a new top block on the network. It will be the *next* block found.

```javascript
daemon.on('topblock', (height) => {
  // do something
})
```

## WebSocket Connections

A WebSocket [socket.io](https://socket.io/) server is initialized if ```enableWebSocket``` is true in the initialization of the module. The server is created on the ```rpcBindPort``` specified - ```2```.

Some events require that the socket is authenticated via a ```auth``` event.

If the **nonce** column is *Yes* you may send a *nonce* in the payload in addition to the options defined.

### Client Initiated Events

|Event|JSON Payload|Nonce Honored|Payload|
|---|---|---|---|
|auth|No|No|*string* sha256 hash of password|
|getBlocks|Yes|Yes|See [daemon.api.getBlocks(options)](#daemonapigetblocksoptions)|
|getBlock|Yes|Yes|See [daemon.api.getBlocks(options)](#daemonapigetblocksoptions)|
|getTransaction|Yes|Yes|See [daemon.api.getTransaction(options)](#daemonapigettransactionoptions)|
|getTransactionPool|Yes|Yes|See [daemon.api.getTransactionPool()](#daemonapigettransactionpool)|
|getBlockCount|Yes|Yes|See [daemon.api.getBlockCount()](#daemonapigetblockcount)|
|getBlockHash|Yes|Yes|See [daemon.api.getBlockHash(options)](#daemonapigetblockhashoptions)|
|getBlockTemplate|Yes|Yes|See [daemon.api.getBlockTemplate(options)](#daemonapigetblocktemplateoptions)|
|submitBlock|Yes|Yes|See [daemon.api.submitBlock(options)](#daemonapisubmitblockoptions)|
|getLastBlockHeader|Yes|Yes|See [daemon.api.getLastBlockHeader()](#daemonapigetlastblockheader)|
|getBlockHeaderByHash|Yes|Yes|See [daemon.api.getBlockHeaderByHash(options)](#daemonapigetblockheaderbyhashoptions)|
|getBlockHeaderByHeight|Yes|Yes|See [daemon.api.getBlockHeaderByHeight(options)](#daemonapigetblockheaderbyheightoptions)|
|getCurrencyId|Yes|Yes|See [daemon.api.getCurrencyId()](#daemonapigetcurrencyid)|
|height|Yes|Yes|See [daemon.api.getHeight()](#daemonapiheight)|
|info|Yes|Yes|See [daemon.api.getInfo()](#daemonapiinfo)|
|fee|Yes|Yes|See [daemon.api.fee()](#daemonapifee)|
|getTransactions|Yes|Yes|See [daemon.api.getTransactions()](#daemonapigettransactions)|
|peers|Yes|Yes|See [daemon.api.getPeers()](#daemonapipeers)|
|sendRawTransaction|Yes|Yes|See [daemon.api.sendRawTransaction()](#daemonapisendrawtransaction)|


### Server Initiated Events

|Event|Authentication Required|Payload|
|---|---|---|
|block|**No**|See [Event - block](#event---block)|
|stopped|Yes|See [Event - stopped](#event---stopped)|
|data|Yes|See [Event - data](#event---data)|
|desync|Yes|See [Event - desync](#event---desync)|
|down|Yes|See [Event - down](#event---down)|
|error|Yes|See [Event - error](#event---error)|
|info|Yes|See [Event - info](#event---info)|
|ready|Yes|See [Event - ready](#event---ready)|
|start|Yes|See [Event - start](#event---start)|
|started|Yes|See [Event - started](#event---started)|
|synced|Yes|See [Event - synced](#event---synced)|
|syncing|Yes|See [Event - syncing](#event---syncing)|
|topblock|**No**|See [Event - topblock](#event---topblock)|
|warning|Yes|*See [Event - warning](#event---warning)|

### Server Responses

All responses except for ***auth*** return data in the same format.

```javascript
{
  "nonce": 123456,
  "data": <payload>
}
```
|Event|Nonced|Payload|
|---|---|---|
|auth|No|*boolean* Responds to a client initiated *auth* event. If **true** the password was correct. If **false** the password was incorrect.|
|getBlocks|Yes|See [daemon.api.getBlocks(options)](#daemonapigetblocksoptions)|
|getBlock|Yes|See [daemon.api.getBlocks(options)](#daemonapigetblocksoptions)|
|getTransaction|Yes|See [daemon.api.getTransaction(options)](#daemonapigettransactionoptions)|
|getTransactionPool|Yes|See [daemon.api.getTransactionPool()](#daemonapigettransactionpool)|
|getBlockCount|Yes|See [daemon.api.getBlockCount()](#daemonapigetblockcount)|
|getBlockHash|Yes|See [daemon.api.getBlockHash(options)](#daemonapigetblockhashoptions)|
|getBlockTemplate|Yes|See [daemon.api.getBlockTemplate(options)](#daemonapigetblocktemplateoptions)|
|submitBlock|Yes|See [daemon.api.submitBlock(options)](#daemonapisubmitblockoptions)|
|getLastBlockHeader|Yes|See [daemon.api.getLastBlockHeader()](#daemonapigetlastblockheader)|
|getBlockHeaderByHash|Yes|See [daemon.api.getBlockHeaderByHash(options)](#daemonapigetblockheaderbyhashoptions)|
|getBlockHeaderByHeight|Yes|See [daemon.api.getBlockHeaderByHeight(options)](#daemonapigetblockheaderbyheightoptions)|
|getCurrencyId|Yes|See [daemon.api.getCurrencyId()](#daemonapigetcurrencyid)|
|height|Yes|See [daemon.api.height()](#daemonapigetheight)|
|info|Yes|See [daemon.api.info()](#daemonapigetinfo)|
|fee|Yes|See [daemon.api.fee()](#daemonapifee)|
|getTransactions|Yes|See [daemon.api.getTransactions()](#daemonapigettransactions)|
|peers|Yes|See [daemon.api.peers()](#daemonapigetpeers)|
|sendRawTransaction|Yes|See [daemon.api.sendRawTransaction()](#daemonapisendrawtransaction)|

## License

```
Copyright (C) 2020 Turtlecoin, The Decentralized Community Cash Developers
Copyright (C) 2018 Brandon Lehmann, The Turtlecoin Developers
Copyright (C) 2019-2020 Deeterd, The Deccash Developers

Please see the included LICENSE file for more information.
```
