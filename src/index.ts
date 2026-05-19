interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Zenodo MCP.
 */


const BASE = 'https://zenodo.org/api';
const UA = 'pipeworx-mcp-zenodo/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Record search.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        type: { type: 'string', description: 'dataset | publication | software | presentation | poster | image | video | other' },
        communities: { type: 'string', description: 'Comma-sep community ids.' },
        sort: { type: 'string', description: 'mostrecent | bestmatch | mostviewed' },
        page: { type: 'number' },
        size: { type: 'number' },
      },
      required: ['query'],
    },
  },
  { name: 'record', description: 'Single record by Zenodo id.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'record_files', description: 'Files in a record.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'communities', description: 'List/search communities.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, page: { type: 'number' }, size: { type: 'number' } } } },
  { name: 'community_records', description: 'Records in a community.', inputSchema: { type: 'object', properties: { id: { type: 'string' }, page: { type: 'number' }, size: { type: 'number' } }, required: ['id'] } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search': {
      const p = new URLSearchParams({
        q: reqStr(args, 'query', '"climate model"'),
        size: String(Math.min(1000, Math.max(1, (args.size as number) ?? 25))),
        page: String(Math.max(1, (args.page as number) ?? 1)),
      });
      if (args.type) p.set('type', String(args.type));
      if (args.communities) p.set('communities', String(args.communities));
      if (args.sort) p.set('sort', String(args.sort));
      return znGet(`/records?${p}`);
    }
    case 'record':
      return znGet(`/records/${encodeURIComponent(reqStr(args, 'id', '"1234567"'))}`);
    case 'record_files':
      return znGet(`/records/${encodeURIComponent(reqStr(args, 'id', '"1234567"'))}/files`);
    case 'communities': {
      const p = new URLSearchParams({
        size: String(Math.min(1000, Math.max(1, (args.size as number) ?? 25))),
        page: String(Math.max(1, (args.page as number) ?? 1)),
      });
      if (args.query) p.set('q', String(args.query));
      return znGet(`/communities?${p}`);
    }
    case 'community_records': {
      const p = new URLSearchParams({
        size: String(Math.min(1000, Math.max(1, (args.size as number) ?? 25))),
        page: String(Math.max(1, (args.page as number) ?? 1)),
      });
      return znGet(`/communities/${encodeURIComponent(reqStr(args, 'id', '"openaire"'))}/records?${p}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function znGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (res.status === 404) throw new Error('Zenodo: not found');
  if (!res.ok) throw new Error(`Zenodo: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
