require("dotenv/config");

const { exec } = require("child_process");
const api = require("./api");
const schedule = require("node-schedule");

var STATUS = true;

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

var sistema = schedule.scheduleJob("*/5 * * * * *", async function () {
  const resposta = await api.get(`/consulta/${process.env.CNPJ}`);
  const { ativo } = resposta.data;
  if (resposta.status !== 200) {
    ativo = true;
  }

  if (ativo != STATUS) {
    STATUS = !STATUS;
    handleServiceFirebird();
  }
});
