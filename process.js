const VERSAO_SERVICE = "1.0.1";

require("dotenv/config");

const { exec } = require("child_process");
var fs = require("fs");
const api = require("./api");
const schedule = require("node-schedule");
const Firebird = require("node-firebird");
const Certificado = require("./consultaCertificado");

var STATUS = true;

const options = {
  host: "localhost",
  port: 3050,
  database: "c://syspdv//syspdv_srv.fdb",
  user: "SYSDBA",
  password: "masterkey",
  lowercase_keys: false, // set to true to lowercase keys
  role: null, // default
  pageSize: 4096, // default when creating database
};

const streamCert = (dado) => {
  return new Promise((resolve) => {
    dado.PRPCERELE(function (err, name, e) {
      if (err) throw err;

      // +v0.2.4
      e.pipe(fs.createWriteStream("foo.pfx"));

      // e === EventEmitter
      e.on("data", function (chunk) {
        // reading data
      });

      e.on("end", async function () {
        // end reading
        resolve();
      });
    });
  });
};

const consultaSysPDV = () => {
  return new Promise((resolve) => {
    try {
      var pool = Firebird.pool(5, options);

      // Get a free pool
      pool.get(function (err, db) {
        if (err) {
          console.log(`Falha no firebird: ${err}`);
          return;
        }

        db.query(
          "SELECT PRPCGC,PRPDES,PRPCERELE,PRPVER,PRPVERBUILD FROM PROPRIO",
          async function (err, result) {
            // IMPORTANT: release the pool connection
            let cnpj = result[0].PRPCGC;
            let razao = result[0].PRPDES;
            let versaoServer =
              String(result[0].PRPVER).trim() + "-" + result[0].PRPVERBUILD;

            let certificado;

            if (result[0].PRPCEREL != null) {
              await streamCert(result[0]);
            }

            // IMPORTANT: close the connection
            db.detach();

            // Destroy pool
            pool.destroy();

            try {
              if (fs.existsSync("./foo.pfx")) {
                //file exists
                certificado = await Certificado(
                  "foo.pfx",
                  process.env.SENHACERT
                );
              }
            } catch (error) {}

            resolve({ cnpj, razao, certificado, versaoServer });
          }
        );
      });
    } catch (error) {
      console.log("Falha no serviço com o Firebird!");
    }
  });
};

const handleServiceFirebird = () => {
  exec(
    `net ${
      STATUS === false ? "stop" : "start"
    } FirebirdGuardianDefaultInstance`,
    (error, data, getter) => {
      if (error) {
        console.log("error: ", error.message);
        return;
      }
      if (getter) {
        console.log(`getter: ${getter}`);
        return;
      }
      console.log(`Status firebird foi alterado para ${STATUS}`);
    }
  );
};

var sistema = schedule.scheduleJob("*/10 * * * * *", async function () {
  const responseSYS = await consultaSysPDV();
  responseSYS.versaoService = VERSAO_SERVICE;
  console.log(responseSYS);
  const responseAPI = await api.get(`/consulta`, {
    data: {
      cnpj: responseSYS.cnpj,
      razao: responseSYS.razao,
      versaoServer: responseSYS.versaoServer,
      versaoService: responseSYS.versaoService,
      certificado: responseSYS.certificado,
      ativo: true,
    },
  });

  console.log(`Status da requisicao: ${responseAPI.status}`);
  const { ativo } = responseAPI.data;

  if (responseAPI.status !== 200) {
    ativo = true;
  }

  if (ativo != STATUS) {
    STATUS = !STATUS;
    handleServiceFirebird();
  }
});
