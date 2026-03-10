import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const profilesPostsCommand: CommandDefinition = {
  name: 'profiles_posts',
  group: 'profiles',
  subcommand: 'posts',
  description: 'Get recent LinkedIn posts for a profile. Requires Enterprise (Profile & Post Data) access. Costs 1 credit per post returned (max 50 per request). Accepts a LinkedIn profile URL or URN.',
  examples: [
    'trigify profiles posts --url "https://www.linkedin.com/in/johndoe"',
    'trigify profiles posts --urn "urn:li:member:12345678"',
    'trigify profiles posts --url "https://linkedin.com/in/johndoe" --limit 25 --pretty',
  ],

  inputSchema: z.object({
    url: z.string().optional().describe('LinkedIn profile URL'),
    urn: z.string().optional().describe('LinkedIn member URN (e.g. urn:li:member:12345678)'),
    limit: z.coerce.number().min(1).max(50).optional().describe('Number of posts to return (max 50, costs 1 credit each)'),
  }),

  cliMappings: {
    options: [
      { field: 'url', flags: '-u, --url <url>', description: 'LinkedIn profile URL' },
      { field: 'urn', flags: '--urn <urn>', description: 'LinkedIn member URN' },
      { field: 'limit', flags: '-l, --limit <number>', description: 'Posts to return (max 50)' },
    ],
  },

  endpoint: { method: 'POST', path: '/profile/posts' },

  fieldMappings: {
    url: 'body',
    urn: 'body',
    limit: 'body',
  },

  handler: (input, client) => executeCommand(profilesPostsCommand, input, client),
};
