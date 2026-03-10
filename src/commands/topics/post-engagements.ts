import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const topicsPostEngagementsCommand: CommandDefinition = {
  name: 'topics_post_engagements',
  group: 'topics',
  subcommand: 'post-engagements',
  description: 'Get engagers for a specific post within a Social Topic.',
  examples: [
    'trigify topics post-engagements <topicId> <postId>',
    'trigify topics post-engagements abc123 post456 --pretty',
  ],

  inputSchema: z.object({
    id: z.string().describe('Topic ID'),
    postId: z.string().describe('Post ID'),
    page: z.coerce.number().min(1).optional().describe('Page number'),
    page_size: z.coerce.number().min(1).max(100).optional().describe('Results per page'),
  }),

  cliMappings: {
    args: [
      { field: 'id', name: 'topicId', required: true },
      { field: 'postId', name: 'postId', required: true },
    ],
    options: [
      { field: 'page', flags: '-p, --page <number>', description: 'Page number' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
    ],
  },

  endpoint: { method: 'GET', path: '/topics/{id}/posts/{postId}/engagements' },

  fieldMappings: {
    id: 'path',
    postId: 'path',
    page: 'query',
    page_size: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(topicsPostEngagementsCommand, input, client),
};
