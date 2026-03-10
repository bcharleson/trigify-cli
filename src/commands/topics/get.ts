import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const topicsGetCommand: CommandDefinition = {
  name: 'topics_get',
  group: 'topics',
  subcommand: 'get',
  description: 'Get details of a specific Social Topic by ID.',
  examples: [
    'trigify topics get <id>',
    'trigify topics get abc123 --pretty',
  ],

  inputSchema: z.object({
    id: z.string().describe('Topic ID'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
  },

  endpoint: { method: 'GET', path: '/topics/{id}' },

  fieldMappings: {
    id: 'path',
  },

  handler: (input, client) => executeCommand(topicsGetCommand, input, client),
};
