import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const topicsCreateCommand: CommandDefinition = {
  name: 'topics_create',
  group: 'topics',
  subcommand: 'create',
  description: 'Create a new Social Topic to monitor LinkedIn keyword mentions. Engagement backfill runs on Day 1, 3, and 5. Topics auto-expire after 30 days. Costs 1 credit per new post, 5 credits per new engagement.',
  examples: [
    'trigify topics create --name "AI tools" --keywords "AI tools,machine learning"',
    'trigify topics create --name "Competitor watch" --keywords "CompanyName" --exclude "job,hiring"',
  ],

  inputSchema: z.object({
    name: z.string().describe('Topic name'),
    keywords: z.string().describe('Keywords to monitor on LinkedIn (comma-separated)'),
    exclude_keywords: z.string().optional().describe('Keywords to exclude (comma-separated)'),
  }),

  cliMappings: {
    options: [
      { field: 'name', flags: '-n, --name <name>', description: 'Topic name' },
      { field: 'keywords', flags: '-k, --keywords <keywords>', description: 'LinkedIn keywords to monitor' },
      { field: 'exclude_keywords', flags: '--exclude <keywords>', description: 'Keywords to exclude' },
    ],
  },

  endpoint: { method: 'POST', path: '/topics' },

  fieldMappings: {
    name: 'body',
    keywords: 'body',
    exclude_keywords: 'body',
  },

  handler: (input, client) => executeCommand(topicsCreateCommand, input, client),
};
