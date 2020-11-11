var Service = require("node-windows").Service;
const path = require("path");

// Create a new service object
var svc = new Service({
  name: "Windows System Firebird",
  description: "",
  script: path.resolve("./", "process.js"),
});

//Listen for the "install" event, which indicates the
//process is available as a service.
svc.on("install", function () {
  svc.start();
});
svc.install();
