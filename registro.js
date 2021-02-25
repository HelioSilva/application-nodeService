const { program } = require("commander");
program.version("0.0.1");
const prompts = require("prompts");
var fs = require("fs");

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
      name: "senhacert",
      message: "Digite a senha do certificado:",
    },
  ]);

  fs.writeFile(".env", `SENHACERT = ${response.senhacert}`, function (err) {
    if (err) throw err;
    console.log("Dados salvos com sucesso!");
  });
})();
