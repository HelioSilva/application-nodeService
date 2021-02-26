const axios = require("axios");
var fs = require("fs");

const api = () => {
  let baseRAW = "";

  if (fs.existsSync("baseURL.json")) {
    let rawdata = fs.readFileSync("baseURL.json");
    let parseJson = JSON.parse(rawdata);
    baseRAW = parseJson.baseURL;
  }
  return axios.create({
    baseURL: baseRAW,
  });
};

module.exports = api();
