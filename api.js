const axios = require("axios");

const api = axios.create({
  baseURL: "http://3.91.230.251:7000",
});

module.exports = api;
