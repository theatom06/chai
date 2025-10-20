import { Command } from "commander";
import chaiJson from "../package.json";


const chai = new Command();

chai
    .name(chaiJson.name)
    .description(chaiJson.description)
    .version(chaiJson.version, "-v, --version", "output the current version")
    .helpOption("-h, --help", "display help for command");
