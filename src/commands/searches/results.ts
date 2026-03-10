import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const searchesResultsCommand: CommandDefinition = {
  name: 'searches_results',
  group: 'searches',
  subcommand: 'results',
  description: 'Get results (mentions/posts) for a specific search. Supports cursor-based pagination.',
  examples: [
    'trigify searches results <id>',
    'trigify searches results <id> --limit 50 --pretty',
    'trigify searches results <id> --cursor "nextcursor123"',
    'trigify searches results <id> --platform linkedin',
  ],

  inputSchema: z.object({
    id: z.string().describe('Search ID'),
    limit: z.coerce.number().min(1).max(100).optional().describe('Number of results to return'),
    cursor: z.string().optional().describe('Pagination cursor from previous response'),
    platform: z.string().optional().describe('Filter by platform: linkedin, twitter, reddit, youtube, podcasts'),
    start_date: z.string().optional().describe('Filter results from this date (ISO 8601)'),
    end_date: z.string().optional().describe('Filter results to this date (ISO 8601)'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
    options: [
      { field: 'limit', flags: '-l, --limit <number>', description: 'Results per page (max 100)' },
      { field: 'cursor', flags: '-c, --cursor <cursor>', description: 'Pagination cursor' },
      { field: 'platform', flags: '--platform <platform>', description: 'Filter by platform' },
      { field: 'start_date', flags: '--start-date <date>', description: 'Start date (ISO 8601)' },
      { field: 'end_date', flags: '--end-date <date>', description: 'End date (ISO 8601)' },
    ],
  },

  endpoint: { method: 'GET', path: '/searches/{id}/results' },

  fieldMappings: {
    id: 'path',
    limit: 'query',
    cursor: 'query',
    platform: 'query',
    start_date: 'query',
    end_date: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(searchesResultsCommand, input, client),
};
