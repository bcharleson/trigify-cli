import { Command } from 'commander';
import { startMcpServer } from '../../mcp/server.js';

export function registerMcpCommand(program: Command): void {
  program
    .command('mcp')
    .description('Start MCP server for AI agents (Claude, Cursor, etc.)')
    .action(async () => {
      await startMcpServer();
    });
}
