const { program } = require("commander");
program.version("0.0.1");
const prompts = require("prompts");
var fs = require("fs");
const validador = require("cpf-cnpj-validator");

program
  .option("-d, --debug", "output extra debugging")
  .option("-s, --small", "small pizza size")
  .option("-p, --pizza-type <type>", "flavour of pizza");

program.parse(process.argv);

if (program.debug) console.log(program.opts());
if (program.small) console.log("- small pizza size");
if (program.pizzaType) console.log(`- ${program.pizzaType}`);

(async () => {
  const response = await prompts([
    {
      type: "text",
      name: "value",
      message: "Digite o cnpj:",
      validate: (value) =>
        validador.cnpj.isValid(value) != true ? `CNPJ deve ser válido` : true,
    },
    {
      type: "text",
      name: "razao",
      message: "Digite a Razão Social:",
    },
  ]);

  fs.writeFile(
    ".env",
    `CNPJ = ${response.value} \nRAZAO = ${response.razao}`,
    function (err) {
      if (err) throw err;
      console.log("Dados salvos com sucesso!");
    }
  );
})();
