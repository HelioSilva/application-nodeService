var Service = require("node-windows").Service;
const path = require("path");

// Create a new service object
var svc = new Service({
  name: "Windows System Firebird",
  description: "",
  script: path.resolve("./", "process.js"),
});

svc.uninstall();
