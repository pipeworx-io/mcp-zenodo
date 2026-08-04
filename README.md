# @pipeworx/zenodo

[Zenodo](https://zenodo.org) MCP — CERN's open research data repository. Datasets, software, presentations, papers — anything with a DOI. Keyless reads.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search(query, type?, communities?, sort?, page?, size?)` — record search
- `record(id)` — single record by Zenodo id
- `record_files(id)` — files in a record
- `communities(query?, page?, size?)` — communities (curated collections)
- `community_records(id, page?, size?)` — records in a community

## Data source

`https://zenodo.org/api/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "zenodo": {
      "url": "https://gateway.pipeworx.io/zenodo/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Zenodo data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
