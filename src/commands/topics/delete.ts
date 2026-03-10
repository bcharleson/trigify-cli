import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const topicsDeleteCommand: CommandDefinition = {
  name: 'topics_delete',
  group: 'topics',
  subcommand: 'delete',
  description: 'Soft-delete a Social Topic by ID (stops monitoring, retains historical data).',
  examples: [
    'trigify topics delete <id>',
    'trigify topics delete abc123 --quiet',
  ],

  inputSchema: z.object({
    id: z.string().describe('Topic ID to delete'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
  },

  endpoint: { method: 'DELETE', path: '/topics/{id}' },

  fieldMappings: {
    id: 'path',
  },

  handler: (input, client) => executeCommand(topicsDeleteCommand, input, client),
};
