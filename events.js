var Web3 = require("web3");
var web3 = new Web3(provider);
var abi = require("./abi.json");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const chalk = require("chalk");

dotenv.load({ path: ".env" });

var provider = new Web3.providers.WebsocketProvider(process.env.ROPSTEN_WSS);

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true }
);
mongoose.connection.on("error", err => {
  console.error(err);
  console.log(
    "%s MongoDB connection error. Please make sure MongoDB is running.",
    chalk.red("✗")
  );
  process.exit();
});

var MoatRopstenAddress = process.env.MOAT_ROPSTEN_ADDRESS;

provider.on("error", error => {
  console.error("WS Infura Error", error);
});

provider.on("end", error => {
  console.log("WS closed");
  console.log("Attempting to reconnect...");
  provider = new Web3.providers.WebsocketProvider(ROPSTEN_WSS);
  provider.on("connect", function() {
    console.log("WSS Reconnected");
  });
  web3.setProvider(provider);
});

var myContract = new web3.eth.Contract(abi, MoatRopstenAddress);

// checking the block number till where the events has been read.
// optimised this process.
setInterval(function() {
  if (db) {
    db.ref("moatgovern/block")
      .once("value")
      .then(data => {
        var data = data.val() || 0;
        web3.eth.getBlockNumber().then(blockNumber => {
          db.ref("moatgovern/block").set(blockNumber);
        });
        getEvents(data);
      })
      .catch(err => {
        console.error(err);
      });
  } else {
    getEvents(0);
  }
}, 15 * 1000);

// reading past events from stated block to latest block
function getEvents(block) {
  myContract.getPastEvents(
    "eInvest",
    {
      filter: { myIndexedParam: [20, 23] },
      fromBlock: block,
      toBlock: "latest"
    },
    function(error, events) {
      if (error) {
        console.error(error);
        // push.note({
        //     title: "[ERROR] eInvest Event",
        //     note: String(error)
        // });
      } else {
        for (var i = 0; i < events.length; i++) {
          AddNewInvest(events[i]);
        }
      }
    }
  );
}

// storing in db
function AddNewInvest(event) {
  console.log(event);
  // add the event data to our central database
}
