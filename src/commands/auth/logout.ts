import { Command } from 'commander';
import { deleteConfig } from '../../core/config.js';
import { output, outputError } from '../../core/output.js';
import type { GlobalOptions } from '../../core/types.js';

export function registerLogoutCommand(program: Command): void {
  program
    .command('logout')
    .description('Remove stored Trigify API key')
    .action(async () => {
      const globalOpts = program.opts() as GlobalOptions;
      try {
        await deleteConfig();
        const result = { status: 'logged_out', message: 'Credentials removed from ~/.trigify/config.json' };
        if (globalOpts.pretty || process.stdin.isTTY) {
          console.log('Logged out. Credentials removed from ~/.trigify/config.json');
        } else {
          output(result, globalOpts);
        }
      } catch (error) {
        outputError(error, globalOpts);
      }
    });
}
