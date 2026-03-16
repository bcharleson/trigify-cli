import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const xLikePostCommand: CommandDefinition = {
  name: 'x_like_post',
  group: 'x',
  subcommand: 'like-post',
  description: 'Like a post on X (Twitter) using your connected account.',
  examples: [
    'trigify x like-post --tweet-id "1234567890123456789"',
  ],

  inputSchema: z.object({
    tweet_id: z.string().describe('X post/tweet ID to like'),
  }),

  cliMappings: {
    options: [
      { field: 'tweet_id', flags: '--tweet-id <id>', description: 'X post/tweet ID to like' },
    ],
  },

  endpoint: { method: 'POST', path: '/x/like-post' },

  fieldMappings: {
    tweet_id: 'body',
  },

  handler: (input, client) => executeCommand(xLikePostCommand, input, client),
};
