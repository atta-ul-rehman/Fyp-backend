const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: "SmukZOOwuK3xIV04kyCcAX1mzoPGjTiZ",
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
