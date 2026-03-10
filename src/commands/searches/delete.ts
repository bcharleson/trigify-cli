import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const searchesDeleteCommand: CommandDefinition = {
  name: 'searches_delete',
  group: 'searches',
  subcommand: 'delete',
  description: 'Delete a social listening search by ID.',
  examples: [
    'trigify searches delete <id>',
    'trigify searches delete abc123 --quiet',
  ],

  inputSchema: z.object({
    id: z.string().describe('Search ID to delete'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
  },

  endpoint: { method: 'DELETE', path: '/searches/{id}' },

  fieldMappings: {
    id: 'path',
  },

  handler: (input, client) => executeCommand(searchesDeleteCommand, input, client),
};
