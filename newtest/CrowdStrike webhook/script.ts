const raw = await Bun.stdin.text();

const headerEnd = raw.indexOf("\r\n\r\n");
const head = headerEnd === -1 ? raw : raw.slice(0, headerEnd);
const body = headerEnd === -1 ? "" : raw.slice(headerEnd + 4);

const [requestLine, ...headerLines] = head.split("\r\n");
const method = requestLine.split(" ")[0]?.toUpperCase() ?? "";

const headers: Record<string, string> = {};
for (const line of headerLines) {
  const i = line.indexOf(":");
  if (i > 0) headers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
}

function respond(status: number, payload: unknown) {
  const json = JSON.stringify(payload);
  process.stdout.write(
    [
      `HTTP/1.1 ${status} ${status === 200 ? "OK" : status === 202 ? "Accepted" : "Bad Request"}`,
      "Content-Type: application/json",
      `Content-Length: ${Buffer.byteLength(json)}`,
      "",
      json,
    ].join("\r\n"),
  );
}

if (method !== "POST") {
  console.error(`rejected ${method} request`);
  respond(405, { error: "method not allowed" });
  process.exit(0);
}

let payload: any;
try {
  payload = JSON.parse(body);
} catch {
  console.error("body was not valid JSON");
  respond(400, { error: "invalid JSON body" });
  process.exit(0);
}

const alerts: any[] = Array.isArray(payload)
  ? payload
  : Array.isArray(payload.resources)
    ? payload.resources
    : Array.isArray(payload.detections)
      ? payload.detections
      : [payload];

const normalized = alerts.map((a) => ({
  id: a.composite_id ?? a.detection_id ?? a.id ?? null,
  name: a.name ?? a.display_name ?? a.tactic ?? null,
  description: a.description ?? null,
  severity: a.severity ?? a.max_severity ?? null,
  severity_name: a.severity_name ?? a.max_severity_displayname ?? null,
  status: a.status ?? null,
  tactic: a.tactic ?? null,
  technique: a.technique ?? null,
  hostname: a.device?.hostname ?? a.hostname ?? null,
  device_id: a.device?.device_id ?? a.device_id ?? null,
  user: a.user_name ?? a.behaviors?.[0]?.user_name ?? null,
  filename: a.filename ?? a.behaviors?.[0]?.filename ?? null,
  sha256: a.sha256 ?? a.behaviors?.[0]?.sha256 ?? null,
  cmdline: a.cmdline ?? a.behaviors?.[0]?.cmdline ?? null,
  created_timestamp: a.created_timestamp ?? a.timestamp ?? null,
  raw: a,
}));

console.error(`received ${normalized.length} CrowdStrike alert(s)`);

respond(200, {
  received: normalized.length,
  received_at: new Date().toISOString(),
  source: "crowdstrike",
  alerts: normalized,
});
