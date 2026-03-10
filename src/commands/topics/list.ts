import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const topicsListCommand: CommandDefinition = {
  name: 'topics_list',
  group: 'topics',
  subcommand: 'list',
  description: 'List all Social Topics (LinkedIn keyword monitors). Topics auto-expire after 30 days.',
  examples: [
    'trigify topics list',
    'trigify topics list --pretty',
    'trigify topics list --page 2 --page-size 20',
  ],

  inputSchema: z.object({
    page: z.coerce.number().min(1).optional().describe('Page number'),
    page_size: z.coerce.number().min(1).max(100).optional().describe('Results per page'),
  }),

  cliMappings: {
    options: [
      { field: 'page', flags: '-p, --page <number>', description: 'Page number' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
    ],
  },

  endpoint: { method: 'GET', path: '/topics' },

  fieldMappings: {
    page: 'query',
    page_size: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(topicsListCommand, input, client),
};
