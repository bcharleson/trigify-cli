import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const profilesEngagementResultsCommand: CommandDefinition = {
  name: 'profiles_engagement_results',
  group: 'profiles',
  subcommand: 'engagement-results',
  description: 'Get profile-level engagement results for tracked LinkedIn profiles. Returns engagement counts and activity for each monitored profile.',
  examples: [
    'trigify profiles engagement-results',
    'trigify profiles engagement-results --urn "urn:li:member:12345678"',
    'trigify profiles engagement-results --tag "icp-tier-1" --pretty',
  ],

  inputSchema: z.object({
    urn: z.string().optional().describe('Filter to a specific LinkedIn member URN'),
    tag: z.string().optional().describe('Filter by profile tag'),
    page: z.coerce.number().min(1).optional().describe('Page number'),
    page_size: z.coerce.number().min(1).max(100).optional().describe('Results per page'),
  }),

  cliMappings: {
    options: [
      { field: 'urn', flags: '--urn <urn>', description: 'Filter to a specific LinkedIn member URN' },
      { field: 'tag', flags: '-t, --tag <tag>', description: 'Filter by tag' },
      { field: 'page', flags: '-p, --page <number>', description: 'Page number' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
    ],
  },

  endpoint: { method: 'POST', path: '/profile/engagement/results' },

  fieldMappings: {
    urn: 'body',
    tag: 'body',
    page: 'body',
    page_size: 'body',
  },

  paginated: true,

  handler: (input, client) => executeCommand(profilesEngagementResultsCommand, input, client),
};
