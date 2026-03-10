import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const profilesEngagementBulkCommand: CommandDefinition = {
  name: 'profiles_engagement_bulk',
  group: 'profiles',
  subcommand: 'engagement-bulk',
  description: 'Bulk upload LinkedIn profiles for engagement tracking. Free to upload; credits charged when engagement data is collected. Requires Enterprise (Profile Engagement Tracking) access.',
  examples: [
    'trigify profiles engagement-bulk --profiles "urn:li:member:111,urn:li:member:222"',
    'trigify profiles engagement-bulk --profiles "urn:li:member:111" --tag "icp-tier-1"',
  ],

  inputSchema: z.object({
    profiles: z.string().describe('Comma-separated list of LinkedIn member URNs to track'),
    tag: z.string().optional().describe('Optional tag/label to group tracked profiles'),
  }),

  cliMappings: {
    options: [
      { field: 'profiles', flags: '-p, --profiles <urns>', description: 'LinkedIn member URNs (comma-separated)' },
      { field: 'tag', flags: '-t, --tag <tag>', description: 'Group tag for tracked profiles' },
    ],
  },

  endpoint: { method: 'POST', path: '/profile/engagement/bulk' },

  fieldMappings: {
    profiles: 'body',
    tag: 'body',
  },

  handler: (input, client) => executeCommand(profilesEngagementBulkCommand, input, client),
};
