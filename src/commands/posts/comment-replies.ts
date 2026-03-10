import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const postsCommentRepliesCommand: CommandDefinition = {
  name: 'posts_comment_replies',
  group: 'posts',
  subcommand: 'comment-replies',
  description: 'Get replies to a specific comment on a LinkedIn post. Requires Enterprise (Profile & Post Data) access. Costs 1 credit per reply returned.',
  examples: [
    'trigify posts comment-replies --post-urn "urn:li:activity:123" --comment-urn "urn:li:comment:456"',
    'trigify posts comment-replies --post-url "https://linkedin.com/feed/update/urn:li:activity:123" --comment-urn "urn:li:comment:456"',
  ],

  inputSchema: z.object({
    post_url: z.string().optional().describe('LinkedIn post URL'),
    post_urn: z.string().optional().describe('LinkedIn post URN'),
    comment_urn: z.string().describe('Comment URN to get replies for'),
    limit: z.coerce.number().min(1).max(100).optional().describe('Number of replies to return (costs 1 credit each)'),
    cursor: z.string().optional().describe('Pagination cursor'),
  }),

  cliMappings: {
    options: [
      { field: 'post_url', flags: '--post-url <url>', description: 'LinkedIn post URL' },
      { field: 'post_urn', flags: '--post-urn <urn>', description: 'LinkedIn post URN' },
      { field: 'comment_urn', flags: '--comment-urn <urn>', description: 'Comment URN' },
      { field: 'limit', flags: '-l, --limit <number>', description: 'Replies to return' },
      { field: 'cursor', flags: '-c, --cursor <cursor>', description: 'Pagination cursor' },
    ],
  },

  endpoint: { method: 'POST', path: '/post/comments/replies' },

  fieldMappings: {
    post_url: 'body',
    post_urn: 'body',
    comment_urn: 'body',
    limit: 'body',
    cursor: 'body',
  },

  handler: (input, client) => executeCommand(postsCommentRepliesCommand, input, client),
};
