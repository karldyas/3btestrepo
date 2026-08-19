Entry point for the workflow. Receives CrowdStrike alert/detection payloads over HTTP.

- **Trigger:** `POST /crowdstrike-alert`
- **Auth:** `external_id` — the caller must include the generated `external_id` query parameter, so CrowdStrike (or any webhook sender) can post without a 3B account. The id is minted on first save and appears in [config.toml](config.toml).

[script.ts](script.ts) parses the raw HTTP request, accepts either a single alert object, a bare array, or a CrowdStrike-style envelope (`resources` / `detections`), and normalizes each alert to a flat shape: `id`, `name`, `severity`, `hostname`, `device_id`, `user`, `filename`, `sha256`, `cmdline`, `created_timestamp`, plus the original object under `raw`.

The response (and the stdout passed to any downstream step) is:

```json
{ "received": 1, "received_at": "…", "source": "crowdstrike", "alerts": [ … ] }
```

Non-POST requests get 405, unparseable bodies get 400. Add downstream steps to `links` in [config.toml](config.toml) to act on the alerts.
