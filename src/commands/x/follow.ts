import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const xFollowCommand: CommandDefinition = {
  name: 'x_follow',
  group: 'x',
  subcommand: 'follow',
  description: 'Follow a user on X (Twitter) using your connected account. Use x lookup-user to get a user ID from a username.',
  examples: [
    'trigify x follow --user-id "44196397"',
    'trigify x follow --user-id "44196397" --pretty',
  ],

  inputSchema: z.object({
    target_user_id: z.string().describe('X user ID to follow (use x lookup-user to resolve from username)'),
  }),

  cliMappings: {
    options: [
      { field: 'target_user_id', flags: '--user-id <id>', description: 'X user ID to follow' },
    ],
  },

  endpoint: { method: 'POST', path: '/x/follow' },

  fieldMappings: {
    target_user_id: 'body',
  },

  handler: (input, client) => executeCommand(xFollowCommand, input, client),
};
