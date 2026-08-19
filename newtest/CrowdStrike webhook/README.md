Entry point for the workflow. Receives CrowdStrike alert/detection payloads over HTTP.

- **Trigger:** `POST /crowdstrike-alert`
- **Auth:** `tenant` — the caller must be an authenticated tenant member. Machine callers (e.g. a Tines story using a service account) send `Authorization: Bearer <api key>`; browsers use their session cookie. Note CrowdStrike itself cannot post directly under this mode.

[script.ts](script.ts) parses the raw HTTP request, accepts either a single alert object, a bare array, or a CrowdStrike-style envelope (`resources` / `detections`), and normalizes each alert to a flat shape: `id`, `name`, `severity`, `hostname`, `device_id`, `user`, `filename`, `sha256`, `cmdline`, `created_timestamp`, plus the original object under `raw`.

The response (and the stdout passed to any downstream step) is:

```json
{ "received": 1, "received_at": "…", "source": "crowdstrike", "alerts": [ … ] }
```

Non-POST requests get 405, unparseable bodies get 400. Add downstream steps to `links` in [config.toml](config.toml) to act on the alerts.
