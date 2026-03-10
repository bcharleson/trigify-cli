import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const searchesGetCommand: CommandDefinition = {
  name: 'searches_get',
  group: 'searches',
  subcommand: 'get',
  description: 'Get details of a specific social listening search by ID.',
  examples: [
    'trigify searches get <id>',
    'trigify searches get abc123 --pretty',
  ],

  inputSchema: z.object({
    id: z.string().describe('Search ID'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
  },

  endpoint: { method: 'GET', path: '/searches/{id}' },

  fieldMappings: {
    id: 'path',
  },

  handler: (input, client) => executeCommand(searchesGetCommand, input, client),
};
