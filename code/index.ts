/// <reference types="bun-types" />
import { Command } from 'commander';
import chaiJson from '../package.json' assert { type: 'json' };

const chai = new Command();

chai
  .name(chaiJson.name)
  .description(chaiJson.description)
  .version(chaiJson.version, '-v, --version', 'output the current version')
  .helpOption('-h, --help', 'display help for command');

// List of command module basenames to load from ./commands
const commandModules = [
  'clean',
  'dashboard',
  'doctor',
  'info',
  'init',
  'install',
  'list',
  'publish',
  'remove',
  'sip',
  'update',
  'upgrade'
];

async function registerCommands() {
  for (const name of commandModules) {
    try {
      const mod = await import(`./commands/${name}.ts`);
      if (mod?.register) {
        mod.register(chai as unknown as Command);
      } else {
        chai
          .command(name)
          .description(`${name} (placeholder - no register export)`) 
          .action(() => console.log(`${name} command not implemented`));
      }
    } catch (err) {
      chai
        .command(name)
        .description(`${name} (placeholder - module failed to load)`) 
        .action(() => console.log(`${name} command failed to load:`, err?.message || err));
    }
  }
}

await registerCommands();

chai.parse(process.argv);
