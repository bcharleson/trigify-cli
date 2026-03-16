import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const xLookupUserCommand: CommandDefinition = {
  name: 'x_lookup_user',
  group: 'x',
  subcommand: 'lookup-user',
  description: 'Look up an X (Twitter) user by username to retrieve their user ID and profile info. Use the returned user_id for follow, DM, and other actions.',
  examples: [
    'trigify x lookup-user --username "elonmusk" --pretty',
    'trigify x lookup-user --username "sama"',
  ],

  inputSchema: z.object({
    username: z.string().describe('X username (without @)'),
  }),

  cliMappings: {
    options: [
      { field: 'username', flags: '--username <username>', description: 'X username (without @)' },
    ],
  },

  endpoint: { method: 'POST', path: '/x/lookup-user' },

  fieldMappings: {
    username: 'body',
  },

  handler: (input, client) => executeCommand(xLookupUserCommand, input, client),
};
