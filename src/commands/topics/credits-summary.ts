import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const topicsCreditsSummaryCommand: CommandDefinition = {
  name: 'topics_credits_summary',
  group: 'topics',
  subcommand: 'credits-summary',
  description: 'Get credit usage summary for a Social Topic (posts found, engagements collected, credits consumed).',
  examples: [
    'trigify topics credits-summary <id>',
    'trigify topics credits-summary abc123 --pretty',
  ],

  inputSchema: z.object({
    id: z.string().describe('Topic ID'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
  },

  endpoint: { method: 'GET', path: '/topics/{id}/credits-summary' },

  fieldMappings: {
    id: 'path',
  },

  handler: (input, client) => executeCommand(topicsCreditsSummaryCommand, input, client),
};
