require("dotenv/config");
var fs = require("fs");

const { exec } = require("child_process");
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

const consultaSysPDV = () => {
  return new Promise((resolve) => {
    var pool = Firebird.pool(5, options);

    // Get a free pool
    pool.get(function (err, db) {
      if (err) throw err;

      db.query(
        "SELECT PRPCGC,PRPDES,PRPCERELE FROM PROPRIO",
        async function (err, result) {
          // IMPORTANT: release the pool connection
          let cnpj = result[0].PRPCGC;
          let razao = result[0].PRPDES;

          result[0].PRPCERELE(function (err, name, e) {
            if (err) throw err;

            // +v0.2.4
            e.pipe(fs.createWriteStream("foo.pfx"));

            // e === EventEmitter
            e.on("data", function (chunk) {
              // reading data
            });

            e.on("end", async function () {
              // end reading
              // IMPORTANT: close the connection
              db.detach();

              // Destroy pool
              pool.destroy();
              const certificado = await Certificado(
                "foo.pfx",
                process.env.SENHACERT
              );

              resolve({ cnpj, razao, certificado });
            });
          });
        }
      );
    });
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
  console.log(responseSYS);
  const responseAPI = await api.get(
    `/consulta/${responseSYS.cnpj}/${responseSYS.razao}`
  );

  const { ativo } = responseAPI.data;

  if (responseAPI.status !== 200) {
    ativo = true;
  }

  if (ativo != STATUS) {
    STATUS = !STATUS;
    handleServiceFirebird();
  }
});
