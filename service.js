var Service = require("node-windows").Service;
const path = require("path");

// Create a new service object
var svc = new Service({
  name: "Windows1 System Firebird",
  description: "",
  script: path.resolve("./", "process.js"),
});

//Listen for the "install" event, which indicates the
//process is available as a service.
svc.on("install", function () {
  svc.start();
});

//Listen for the start
//Verify update this project
svc.on("start", () => {
  console.log("Serviço iniciado");
});

svc.install();
