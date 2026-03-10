import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const postsEngagementsCommand: CommandDefinition = {
  name: 'posts_engagements',
  group: 'posts',
  subcommand: 'engagements',
  description: 'Get people who engaged (liked, commented, shared) on a LinkedIn post. Requires Enterprise (Profile & Post Data) access. Costs 1 credit per engagement returned.',
  examples: [
    'trigify posts engagements --url "https://www.linkedin.com/feed/update/urn:li:activity:123"',
    'trigify posts engagements --urn "urn:li:activity:123456789" --limit 50',
  ],

  inputSchema: z.object({
    url: z.string().optional().describe('LinkedIn post URL'),
    urn: z.string().optional().describe('LinkedIn post URN (e.g. urn:li:activity:123456789)'),
    limit: z.coerce.number().min(1).max(100).optional().describe('Number of engagements to return (costs 1 credit each)'),
    cursor: z.string().optional().describe('Pagination cursor'),
  }),

  cliMappings: {
    options: [
      { field: 'url', flags: '-u, --url <url>', description: 'LinkedIn post URL' },
      { field: 'urn', flags: '--urn <urn>', description: 'LinkedIn post URN' },
      { field: 'limit', flags: '-l, --limit <number>', description: 'Engagements to return' },
      { field: 'cursor', flags: '-c, --cursor <cursor>', description: 'Pagination cursor' },
    ],
  },

  endpoint: { method: 'POST', path: '/post/engagements' },

  fieldMappings: {
    url: 'body',
    urn: 'body',
    limit: 'body',
    cursor: 'body',
  },

  handler: (input, client) => executeCommand(postsEngagementsCommand, input, client),
};
