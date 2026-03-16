import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const xConnectCommand: CommandDefinition = {
  name: 'x_connect',
  group: 'x',
  subcommand: 'connect',
  description: 'Get the OAuth connection URL and current status for your X (Twitter) account. Must connect before using any X action endpoints.',
  examples: [
    'trigify x connect --pretty',
  ],

  inputSchema: z.object({}),

  cliMappings: {},

  endpoint: { method: 'GET', path: '/x/connect' },

  fieldMappings: {},

  handler: (input, client) => executeCommand(xConnectCommand, input, client),
};
