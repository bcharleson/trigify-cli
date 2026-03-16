import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const xCreatePostCommand: CommandDefinition = {
  name: 'x_create_post',
  group: 'x',
  subcommand: 'create-post',
  description: 'Create a new post on X (Twitter) using your connected account.',
  examples: [
    'trigify x create-post --text "Excited to announce our new API integration!"',
    'trigify x create-post --text "Check out trigify-cli for agent-native social listening" --pretty',
  ],

  inputSchema: z.object({
    text: z.string().max(280).describe('Post text (max 280 characters)'),
  }),

  cliMappings: {
    options: [
      { field: 'text', flags: '--text <text>', description: 'Post text (max 280 characters)' },
    ],
  },

  endpoint: { method: 'POST', path: '/x/create-post' },

  fieldMappings: {
    text: 'body',
  },

  handler: (input, client) => executeCommand(xCreatePostCommand, input, client),
};
