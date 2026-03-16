import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const xRepostCommand: CommandDefinition = {
  name: 'x_repost',
  group: 'x',
  subcommand: 'repost',
  description: 'Repost (retweet) a post on X (Twitter) using your connected account.',
  examples: [
    'trigify x repost --tweet-id "1234567890123456789"',
  ],

  inputSchema: z.object({
    tweet_id: z.string().describe('X post/tweet ID to repost'),
  }),

  cliMappings: {
    options: [
      { field: 'tweet_id', flags: '--tweet-id <id>', description: 'X post/tweet ID to repost' },
    ],
  },

  endpoint: { method: 'POST', path: '/x/repost' },

  fieldMappings: {
    tweet_id: 'body',
  },

  handler: (input, client) => executeCommand(xRepostCommand, input, client),
};
