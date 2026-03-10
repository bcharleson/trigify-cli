import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const enrichCompanyCommand: CommandDefinition = {
  name: 'enrich_company',
  group: 'enrich',
  subcommand: 'company',
  description: 'Enrich a LinkedIn company page URL to get the company ID and firmographic data. Useful before filtering by company in social mapping.',
  examples: [
    'trigify enrich company --url "https://www.linkedin.com/company/trigify"',
    'trigify enrich company --url "https://linkedin.com/company/openai" --pretty',
  ],

  inputSchema: z.object({
    url: z.string().describe('LinkedIn company page URL'),
  }),

  cliMappings: {
    options: [
      { field: 'url', flags: '-u, --url <url>', description: 'LinkedIn company URL' },
    ],
  },

  endpoint: { method: 'POST', path: '/company/enrich' },

  fieldMappings: {
    url: 'body',
  },

  handler: (input, client) => executeCommand(enrichCompanyCommand, input, client),
};
