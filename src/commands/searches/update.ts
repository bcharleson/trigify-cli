import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const searchesUpdateCommand: CommandDefinition = {
  name: 'searches_update',
  group: 'searches',
  subcommand: 'update',
  description: 'Update an existing search (name, keywords, status, platforms).',
  examples: [
    'trigify searches update <id> --name "New name"',
    'trigify searches update <id> --keywords "new,keywords"',
    'trigify searches update <id> --status active',
  ],

  inputSchema: z.object({
    id: z.string().describe('Search ID'),
    name: z.string().optional().describe('New name for the search'),
    keywords: z.string().optional().describe('Updated keywords (comma-separated)'),
    platforms: z.string().optional().describe('Updated platforms (comma-separated)'),
    status: z.string().optional().describe('Search status: active or paused'),
    exclude_keywords: z.string().optional().describe('Updated exclusion keywords'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
    options: [
      { field: 'name', flags: '-n, --name <name>', description: 'New search name' },
      { field: 'keywords', flags: '-k, --keywords <keywords>', description: 'Updated keywords' },
      { field: 'platforms', flags: '--platforms <platforms>', description: 'Updated platforms' },
      { field: 'status', flags: '-s, --status <status>', description: 'Status: active or paused' },
      { field: 'exclude_keywords', flags: '--exclude-keywords <keywords>', description: 'Updated exclusion keywords' },
    ],
  },

  endpoint: { method: 'PATCH', path: '/searches/{id}' },

  fieldMappings: {
    id: 'path',
    name: 'body',
    keywords: 'body',
    platforms: 'body',
    status: 'body',
    exclude_keywords: 'body',
  },

  handler: (input, client) => executeCommand(searchesUpdateCommand, input, client),
};
