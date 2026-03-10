import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const topicsUpdateCommand: CommandDefinition = {
  name: 'topics_update',
  group: 'topics',
  subcommand: 'update',
  description: 'Update a Social Topic name or status (active/paused).',
  examples: [
    'trigify topics update <id> --name "New name"',
    'trigify topics update <id> --status paused',
    'trigify topics update <id> --status active',
  ],

  inputSchema: z.object({
    id: z.string().describe('Topic ID'),
    name: z.string().optional().describe('New topic name'),
    status: z.enum(['active', 'paused']).optional().describe('Topic status'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],
    options: [
      { field: 'name', flags: '-n, --name <name>', description: 'New topic name' },
      { field: 'status', flags: '-s, --status <status>', description: 'Status: active or paused' },
    ],
  },

  endpoint: { method: 'PATCH', path: '/topics/{id}' },

  fieldMappings: {
    id: 'path',
    name: 'body',
    status: 'body',
  },

  handler: (input, client) => executeCommand(topicsUpdateCommand, input, client),
};
