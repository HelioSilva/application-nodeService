var os = require("os");

if (os.platform() == "win32") {
  if (os.arch() == "ia32") {
    var chilkat = require("@chilkat/ck-node14-win-ia32");
  } else {
    var chilkat = require("@chilkat/ck-node14-win64");
  }
} else if (os.platform() == "linux") {
  if (os.arch() == "arm") {
    var chilkat = require("@chilkat/ck-node14-arm");
  } else if (os.arch() == "x86") {
    var chilkat = require("@chilkat/ck-node14-linux32");
  } else {
    var chilkat = require("@chilkat/ck-node14-linux64");
  }
} else if (os.platform() == "darwin") {
  var chilkat = require("@chilkat/ck-node14-macosx");
}

const dadosCert = (certificado, senha) => {
  return new Promise((resolve) => {
    var cert = new chilkat.Cert();

    var success;

    // Load from the PFX file
    var pfxFilename = certificado;
    var pfxPassword = senha;

    success = cert.LoadPfxFile(pfxFilename, pfxPassword);
    if (success !== true) {
      console.log("Erro na leitura do arquivo!");
      resolve({ empresa: null, serial: null, validate: null });
    }

    resolve({
      empresa: cert.SubjectCN,
      serial: cert.SerialNumber,
      validade: cert.ValidToStr,
    });
  });
};

module.exports = dadosCert;
