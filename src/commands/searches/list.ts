import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const searchesListCommand: CommandDefinition = {
  name: 'searches_list',
  group: 'searches',
  subcommand: 'list',
  description: 'List all social listening searches. Returns search name, keywords, status, and metadata.',
  examples: [
    'trigify searches list',
    'trigify searches list --pretty',
    'trigify searches list --fields "id,name,status"',
  ],

  inputSchema: z.object({
    page: z.coerce.number().min(1).optional().describe('Page number (1-indexed)'),
    page_size: z.coerce.number().min(1).max(100).optional().describe('Results per page'),
  }),

  cliMappings: {
    options: [
      { field: 'page', flags: '-p, --page <number>', description: 'Page number' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
    ],
  },

  endpoint: { method: 'GET', path: '/searches' },

  fieldMappings: {
    page: 'query',
    page_size: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(searchesListCommand, input, client),
};
