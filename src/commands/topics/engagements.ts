import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const topicsEngagementsCommand: CommandDefinition = {
  name: 'topics_engagements',
  group: 'topics',
  subcommand: 'engagements',
  description: 'Get deduplicated list of people who engaged with posts matching a Social Topic.',
  examples: [
    'trigify topics engagements <id>',
    'trigify topics engagements <id> --pretty',
    'trigify topics engagements <id> --page 2',
  ],

  inputSchema: z.object({
    id: z.string().describe('Topic ID'),
    page: z.coerce.number().min(1).optional().describe('Page number'),
    page_size: z.coerce.number().min(1).max(100).optional().describe('Results per page'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
    options: [
      { field: 'page', flags: '-p, --page <number>', description: 'Page number' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
    ],
  },

  endpoint: { method: 'GET', path: '/topics/{id}/engagements' },

  fieldMappings: {
    id: 'path',
    page: 'query',
    page_size: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(topicsEngagementsCommand, input, client),
};
