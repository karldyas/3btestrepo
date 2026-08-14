A sample tool-using agent, built from the `agent` template, to show the shape end to end.

It answers research questions by fetching pages instead of relying on memory: the model decides which
URL to read, reads it, and follows leads until it can answer with citations.

**Trigger.** `POST /research-agent` (space members only). The route makes this an *interactive* agent —
a caller holds the connection, and the whole turn runs in one step execution, streaming NDJSON
`AgentEvent` lines back as the response.

**Request body.**

```json
{ "message": "What does the 3B docs page say about volumes?", "conversation_id": "optional-thread-id" }
```

Send only the new message — the transcript lives server-side under `/storage/conversations`, keyed by
the authenticated caller and conversation id. Reuse a `conversation_id` to continue a thread; omit it
and the agent mints one and returns it in the first `conversation` event.

**Tools.** [tools/fetchUrl.ts](tools/fetchUrl.ts) fetches a page and strips it to text (15k char cap);
[tools/getTime.ts](tools/getTime.ts) gives the current UTC time. Both are read-only.

**Model.** Configured in [model.json](model.json); credentials come from the Anthropic connector on
this step. Instructions are in [system.md](system.md), and the trigger payload is mapped to the
agent's input by `buildInput` in [agent.ts](agent.ts).
