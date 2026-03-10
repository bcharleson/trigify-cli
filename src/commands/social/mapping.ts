import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const socialMappingCommand: CommandDefinition = {
  name: 'social_mapping',
  group: 'social',
  subcommand: 'mapping',
  description: 'Query the engagement graph to find people who engage with specific LinkedIn content, filtered by firmographic criteria. Supports filtering by company size, industry, job title, seniority, and location. Credits charged per result returned.',
  examples: [
    'trigify social mapping --keywords "AI,machine learning" --pretty',
    'trigify social mapping --keywords "GTM,sales" --company-size "51-200" --industry "SaaS"',
    'trigify social mapping --keywords "outbound" --seniority "VP,Director" --limit 50',
  ],

  inputSchema: z.object({
    keywords: z.string().describe('Keywords to find engagers for (comma-separated)'),
    limit: z.coerce.number().min(1).max(100).optional().describe('Number of results to return'),
    cursor: z.string().optional().describe('Pagination cursor'),
    company_size: z.string().optional().describe('Filter by company size range (e.g. "11-50", "51-200", "201-500")'),
    industry: z.string().optional().describe('Filter by industry'),
    job_title: z.string().optional().describe('Filter by job title keywords'),
    seniority: z.string().optional().describe('Filter by seniority level (e.g. "Director,VP,C-Level")'),
    location: z.string().optional().describe('Filter by location'),
    exclude_keywords: z.string().optional().describe('Keywords to exclude from results'),
  }),

  cliMappings: {
    options: [
      { field: 'keywords', flags: '-k, --keywords <keywords>', description: 'Keywords to find engagers for' },
      { field: 'limit', flags: '-l, --limit <number>', description: 'Results to return' },
      { field: 'cursor', flags: '-c, --cursor <cursor>', description: 'Pagination cursor' },
      { field: 'company_size', flags: '--company-size <size>', description: 'Filter by company size' },
      { field: 'industry', flags: '--industry <industry>', description: 'Filter by industry' },
      { field: 'job_title', flags: '--job-title <title>', description: 'Filter by job title' },
      { field: 'seniority', flags: '--seniority <levels>', description: 'Filter by seniority (comma-separated)' },
      { field: 'location', flags: '--location <location>', description: 'Filter by location' },
      { field: 'exclude_keywords', flags: '--exclude <keywords>', description: 'Keywords to exclude' },
    ],
  },

  endpoint: { method: 'POST', path: '/social/mapping' },

  fieldMappings: {
    keywords: 'body',
    limit: 'body',
    cursor: 'body',
    company_size: 'body',
    industry: 'body',
    job_title: 'body',
    seniority: 'body',
    location: 'body',
    exclude_keywords: 'body',
  },

  paginated: true,

  handler: (input, client) => executeCommand(socialMappingCommand, input, client),
};
