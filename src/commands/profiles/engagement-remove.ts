import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const profilesEngagementRemoveCommand: CommandDefinition = {
  name: 'profiles_engagement_remove',
  group: 'profiles',
  subcommand: 'engagement-remove',
  description: 'Stop monitoring a LinkedIn profile for engagement tracking. Removes the profile from the tracked list.',
  examples: [
    'trigify profiles engagement-remove --urn "urn:li:member:12345678"',
    'trigify profiles engagement-remove --urn "urn:li:member:12345678" --quiet',
  ],

  inputSchema: z.object({
    urn: z.string().describe('LinkedIn member URN to stop monitoring'),
  }),

  cliMappings: {
    options: [
      { field: 'urn', flags: '--urn <urn>', description: 'LinkedIn member URN to remove' },
    ],
  },

  endpoint: { method: 'POST', path: '/profile/engagement/remove' },

  fieldMappings: {
    urn: 'body',
  },

  handler: (input, client) => executeCommand(profilesEngagementRemoveCommand, input, client),
};
