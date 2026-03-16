import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const companyPostsCommand: CommandDefinition = {
  name: 'company_posts',
  group: 'company',
  subcommand: 'posts',
  description: 'Get recent posts from a LinkedIn company page. Requires Enterprise access.',
  examples: [
    'trigify company posts --url "https://www.linkedin.com/company/trigify" --pretty',
    'trigify company posts --url "https://linkedin.com/company/hubspot" --limit 10',
  ],

  inputSchema: z.object({
    companyUrl: z.string().describe('LinkedIn company page URL'),
    limit: z.coerce.number().min(1).max(50).optional().describe('Number of posts to return'),
  }),

  cliMappings: {
    options: [
      { field: 'companyUrl', flags: '-u, --url <url>', description: 'LinkedIn company page URL' },
      { field: 'limit', flags: '-l, --limit <number>', description: 'Number of posts to return' },
    ],
  },

  endpoint: { method: 'POST', path: '/company/posts' },

  fieldMappings: {
    companyUrl: 'body',
    limit: 'body',
  },

  handler: (input, client) => executeCommand(companyPostsCommand, input, client),
};
