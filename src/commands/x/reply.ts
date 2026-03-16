import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const xReplyCommand: CommandDefinition = {
  name: 'x_reply',
  group: 'x',
  subcommand: 'reply',
  description: 'Reply to a post on X (Twitter) using your connected account.',
  examples: [
    'trigify x reply --tweet-id "1234567890123456789" --text "Great insight! Thanks for sharing."',
  ],

  inputSchema: z.object({
    tweet_id: z.string().describe('X post/tweet ID to reply to'),
    text: z.string().max(280).describe('Reply text (max 280 characters)'),
  }),

  cliMappings: {
    options: [
      { field: 'tweet_id', flags: '--tweet-id <id>', description: 'X post/tweet ID to reply to' },
      { field: 'text', flags: '--text <text>', description: 'Reply text (max 280 characters)' },
    ],
  },

  endpoint: { method: 'POST', path: '/x/reply' },

  fieldMappings: {
    tweet_id: 'body',
    text: 'body',
  },

  handler: (input, client) => executeCommand(xReplyCommand, input, client),
};
