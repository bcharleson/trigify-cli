import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const xSendDmCommand: CommandDefinition = {
  name: 'x_send_dm',
  group: 'x',
  subcommand: 'send-dm',
  description: 'Send a direct message to a user on X (Twitter) using your connected account. Use x lookup-user to get a user ID from a username.',
  examples: [
    'trigify x send-dm --user-id "44196397" --text "Hey, loved your recent thread on AI agents!"',
  ],

  inputSchema: z.object({
    user_id: z.string().describe('X user ID to message (use x lookup-user to resolve from username)'),
    text: z.string().describe('Message text'),
  }),

  cliMappings: {
    options: [
      { field: 'user_id', flags: '--user-id <id>', description: 'X user ID to message' },
      { field: 'text', flags: '--text <text>', description: 'Message text' },
    ],
  },

  endpoint: { method: 'POST', path: '/x/send-dm' },

  fieldMappings: {
    user_id: 'body',
    text: 'body',
  },

  handler: (input, client) => executeCommand(xSendDmCommand, input, client),
};
