import { Command } from 'commander';
import type { CommandDefinition, GlobalOptions } from '../core/types.js';
import { resolveApiKey } from '../core/auth.js';
import { TrigifyClient } from '../core/client.js';
import { output, outputError } from '../core/output.js';

// Auth commands (special — no API client needed)
import { registerLoginCommand } from './auth/login.js';
import { registerLogoutCommand } from './auth/logout.js';

// MCP server command
import { registerMcpCommand } from './mcp/index.js';

// Searches
import { searchesListCommand } from './searches/list.js';
import { searchesGetCommand } from './searches/get.js';
import { searchesCreateCommand } from './searches/create.js';
import { searchesUpdateCommand } from './searches/update.js';
import { searchesDeleteCommand } from './searches/delete.js';
import { searchesResultsCommand } from './searches/results.js';

// Topics
import { topicsListCommand } from './topics/list.js';
import { topicsGetCommand } from './topics/get.js';
import { topicsCreateCommand } from './topics/create.js';
import { topicsUpdateCommand } from './topics/update.js';
import { topicsDeleteCommand } from './topics/delete.js';
import { topicsEngagementsCommand } from './topics/engagements.js';
import { topicsPostEngagementsCommand } from './topics/post-engagements.js';
import { topicsCreditsSummaryCommand } from './topics/credits-summary.js';

// Profiles
import { profilesPostsCommand } from './profiles/posts.js';
import { profilesEnrichCommand } from './profiles/enrich.js';
import { profilesEngagementBulkCommand } from './profiles/engagement-bulk.js';
import { profilesEngagementResultsCommand } from './profiles/engagement-results.js';
import { profilesEngagementPostResultsCommand } from './profiles/engagement-post-results.js';
import { profilesEngagementRemoveCommand } from './profiles/engagement-remove.js';

// Posts
import { postsEngagementsCommand } from './posts/engagements.js';
import { postsCommentsCommand } from './posts/comments.js';
import { postsCommentRepliesCommand } from './posts/comment-replies.js';

// Social
import { socialMappingCommand } from './social/mapping.js';

// Enrich
import { enrichCompanyCommand } from './enrich/company.js';

/** All command definitions — the single source of truth for CLI + MCP */
export const allCommands: CommandDefinition[] = [
  // Searches (Social Listening — Standard)
  searchesListCommand,
  searchesGetCommand,
  searchesCreateCommand,
  searchesUpdateCommand,
  searchesDeleteCommand,
  searchesResultsCommand,

  // Topics (Social Topics — Enterprise)
  topicsListCommand,
  topicsGetCommand,
  topicsCreateCommand,
  topicsUpdateCommand,
  topicsDeleteCommand,
  topicsEngagementsCommand,
  topicsPostEngagementsCommand,
  topicsCreditsSummaryCommand,

  // Profiles (Profile & Post Data + Engagement Tracking — Enterprise)
  profilesPostsCommand,
  profilesEnrichCommand,
  profilesEngagementBulkCommand,
  profilesEngagementResultsCommand,
  profilesEngagementPostResultsCommand,
  profilesEngagementRemoveCommand,

  // Posts (Profile & Post Data — Enterprise)
  postsEngagementsCommand,
  postsCommentsCommand,
  postsCommentRepliesCommand,

  // Social Mapping (Enterprise)
  socialMappingCommand,

  // Enrich (undocumented helpers)
  enrichCompanyCommand,
];

export function registerAllCommands(program: Command): void {
  // Auth commands (special handling — no API client needed)
  registerLoginCommand(program);
  registerLogoutCommand(program);

  // MCP server command
  registerMcpCommand(program);

  // Group commands by their `group` field
  const groups = new Map<string, CommandDefinition[]>();
  for (const cmd of allCommands) {
    if (!groups.has(cmd.group)) groups.set(cmd.group, []);
    groups.get(cmd.group)!.push(cmd);
  }

  for (const [groupName, commands] of groups) {
    const groupCmd = program
      .command(groupName)
      .description(`Manage ${groupName}`);

    for (const cmdDef of commands) {
      registerCommand(groupCmd, cmdDef);
    }

    groupCmd.on('command:*', (operands: string[]) => {
      const available = commands.map((c) => c.subcommand).join(', ');
      console.error(`error: unknown command '${operands[0]}' for '${groupName}'`);
      console.error(`Available commands: ${available}`);
      process.exitCode = 1;
    });
  }
}

function registerCommand(parent: Command, cmdDef: CommandDefinition): void {
  const cmd = parent
    .command(cmdDef.subcommand)
    .description(cmdDef.description);

  if (cmdDef.cliMappings.args) {
    for (const arg of cmdDef.cliMappings.args) {
      const argStr = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
      cmd.argument(argStr, `${arg.field}`);
    }
  }

  if (cmdDef.cliMappings.options) {
    for (const opt of cmdDef.cliMappings.options) {
      cmd.option(opt.flags, opt.description ?? '');
    }
  }

  if (cmdDef.examples?.length) {
    cmd.addHelpText('after', '\nExamples:\n' + cmdDef.examples.map((e) => `  $ ${e}`).join('\n'));
  }

  cmd.action(async (...actionArgs: any[]) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions & Record<string, any>;

      if (globalOpts.pretty) {
        globalOpts.output = 'pretty';
      }

      const apiKey = await resolveApiKey(globalOpts.apiKey);
      const client = new TrigifyClient({ apiKey });

      const input: Record<string, any> = {};

      if (cmdDef.cliMappings.args) {
        for (let i = 0; i < cmdDef.cliMappings.args.length; i++) {
          const argDef = cmdDef.cliMappings.args[i];
          if (actionArgs[i] !== undefined) {
            input[argDef.field] = actionArgs[i];
          }
        }
      }

      if (cmdDef.cliMappings.options) {
        for (const opt of cmdDef.cliMappings.options) {
          const match = opt.flags.match(/--([a-z][a-z0-9-]*)/);
          if (match) {
            const optName = match[1].replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
            if (globalOpts[optName] !== undefined) {
              input[opt.field] = globalOpts[optName];
            }
          }
        }
      }

      const parsed = cmdDef.inputSchema.safeParse(input);
      if (!parsed.success) {
        const issues = parsed.error.issues ?? [];
        const missing = issues
          .filter((i: any) => i.code === 'invalid_type' && String(i.message).includes('received undefined'))
          .map((i: any) => '--' + String(i.path?.[0] ?? '').replace(/_/g, '-'));
        if (missing.length > 0) {
          throw new Error(`Missing required option(s): ${missing.join(', ')}`);
        }
        const msg = issues.map((i: any) => `${i.path?.join('.')}: ${i.message}`).join('; ');
        throw new Error(`Invalid input: ${msg}`);
      }

      const result = await cmdDef.handler(parsed.data, client);
      output(result, globalOpts);
    } catch (error) {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      outputError(error, globalOpts);
    }
  });
}
