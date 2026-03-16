import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const xDeletePostCommand: CommandDefinition = {
  name: 'x_delete_post',
  group: 'x',
  subcommand: 'delete-post',
  description: 'Delete a post on X (Twitter) using your connected account.',
  examples: [
    'trigify x delete-post --tweet-id "1234567890123456789"',
  ],

  inputSchema: z.object({
    tweet_id: z.string().describe('X post/tweet ID to delete'),
  }),

  cliMappings: {
    options: [
      { field: 'tweet_id', flags: '--tweet-id <id>', description: 'X post/tweet ID to delete' },
    ],
  },

  endpoint: { method: 'POST', path: '/x/delete-post' },

  fieldMappings: {
    tweet_id: 'body',
  },

  handler: (input, client) => executeCommand(xDeletePostCommand, input, client),
};
