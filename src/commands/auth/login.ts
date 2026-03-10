import { Command } from 'commander';
import { TrigifyClient } from '../../core/client.js';
import { saveConfig } from '../../core/config.js';
import { output, outputError } from '../../core/output.js';
import type { GlobalOptions } from '../../core/types.js';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Authenticate with your Trigify API key')
    .option('--api-key <key>', 'API key (skips interactive prompt)')
    .action(async (opts) => {
      const globalOpts = program.opts() as GlobalOptions;

      try {
        let apiKey = opts.apiKey || process.env.TRIGIFY_API_KEY;

        if (!apiKey) {
          if (!process.stdin.isTTY) {
            outputError(
              new Error('No API key provided. Use --api-key or set TRIGIFY_API_KEY'),
              globalOpts,
            );
            return;
          }

          console.log('Get your API key from: https://app.trigify.io/settings\n');

          const [major] = process.versions.node.split('.').map(Number);
          if (major < 20) {
            outputError(
              new Error('Interactive login requires Node.js 20+. Use --api-key or set TRIGIFY_API_KEY instead.'),
              globalOpts,
            );
            return;
          }
          const { password } = await import('@inquirer/prompts');
          apiKey = await password({
            message: 'Enter your Trigify API key:',
            mask: '*',
          });
        }

        if (!apiKey) {
          outputError(new Error('No API key provided'), globalOpts);
          return;
        }

        const client = new TrigifyClient({ apiKey });

        if (globalOpts.pretty || process.stdin.isTTY) {
          console.log('Validating API key...');
        }

        // Validate the key by fetching the searches list (lightweight)
        try {
          await client.get('/searches');
        } catch (err: any) {
          if (err.code === 'AUTH_ERROR') {
            outputError(new Error('Invalid API key — authentication failed'), globalOpts);
            return;
          }
          // Other errors (e.g. enterprise-only endpoint) still mean the key is valid
        }

        await saveConfig({ api_key: apiKey });

        const result = {
          status: 'authenticated',
          config_path: '~/.trigify/config.json',
        };

        if (globalOpts.pretty || process.stdin.isTTY) {
          console.log('\nAuthenticated successfully!');
          console.log('Config saved to ~/.trigify/config.json');
        } else {
          output(result, globalOpts);
        }
      } catch (error) {
        outputError(error, globalOpts);
      }
    });
}
