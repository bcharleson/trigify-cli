import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const profilesEnrichCommand: CommandDefinition = {
  name: 'profiles_enrich',
  group: 'profiles',
  subcommand: 'enrich',
  description: 'Enrich a LinkedIn profile URL to get the member URN and profile data. Useful before tracking engagement or fetching posts.',
  examples: [
    'trigify profiles enrich --url "https://www.linkedin.com/in/johndoe"',
    'trigify profiles enrich --url "https://linkedin.com/in/johndoe" --pretty',
  ],

  inputSchema: z.object({
    url: z.string().describe('LinkedIn profile URL'),
  }),

  cliMappings: {
    options: [
      { field: 'url', flags: '-u, --url <url>', description: 'LinkedIn profile URL' },
    ],
  },

  endpoint: { method: 'POST', path: '/profile/enrich' },

  fieldMappings: {
    url: 'body',
  },

  handler: (input, client) => executeCommand(profilesEnrichCommand, input, client),
};
