import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const searchesCreateCommand: CommandDefinition = {
  name: 'searches_create',
  group: 'searches',
  subcommand: 'create',
  description: 'Create a new social listening search. Costs 1 credit. Monitors LinkedIn, Twitter, Reddit, YouTube, and Podcasts for keyword mentions.',
  examples: [
    'trigify searches create --name "AI mentions" --keywords "artificial intelligence,AI startup"',
    'trigify searches create --name "Brand monitoring" --keywords "Trigify" --platforms "linkedin,twitter"',
  ],

  inputSchema: z.object({
    name: z.string().describe('Name for the search'),
    keywords: z.string().describe('Comma-separated keywords to monitor'),
    platforms: z.string().optional().describe('Comma-separated platforms: linkedin, twitter, reddit, youtube, podcasts'),
    exclude_keywords: z.string().optional().describe('Comma-separated keywords to exclude'),
  }),

  cliMappings: {
    options: [
      { field: 'name', flags: '-n, --name <name>', description: 'Search name' },
      { field: 'keywords', flags: '-k, --keywords <keywords>', description: 'Keywords to monitor (comma-separated)' },
      { field: 'platforms', flags: '--platforms <platforms>', description: 'Platforms to monitor (comma-separated)' },
      { field: 'exclude_keywords', flags: '--exclude-keywords <keywords>', description: 'Keywords to exclude' },
    ],
  },

  endpoint: { method: 'POST', path: '/searches' },

  fieldMappings: {
    name: 'body',
    keywords: 'body',
    platforms: 'body',
    exclude_keywords: 'body',
  },

  handler: (input, client) => executeCommand(searchesCreateCommand, input, client),
};
