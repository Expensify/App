# Remote Tenancy

## When to open this file

Open this file for remote daemon HTTP flows, including `--remote-config` launches, that let an agent running in a Linux sandbox talk to another `agent-device` instance on a remote macOS host in order to control devices that are not available locally. This file covers daemon URL setup, authentication, lease allocation, and tenant-scoped command admission.

## Main commands to reach for first

- `agent-device open <app> --remote-config <path> --relaunch`
- `AGENT_DEVICE_DAEMON_BASE_URL=...`
- `AGENT_DEVICE_DAEMON_AUTH_TOKEN=...`
- `agent-device --tenant ... --session-isolation tenant --run-id ... --lease-id ...`

## Most common mistake to avoid

Do not run a tenant-isolated command without matching `tenant`, `run`, and `lease` scope. Admission checks require all three to line up.

## Preferred remote launch path

Use this when the agent needs the simplest remote control flow: a Linux sandbox agent talks over HTTP to `agent-device` on a remote macOS host and launches the target app through a checked-in `--remote-config` profile.

```bash
agent-device open com.example.myapp --remote-config ./agent-device.remote.json --relaunch
```

- This is the preferred remote launch path for sandbox or cloud agents.
- For Android React Native relaunch flows, install or reinstall the APK first, then relaunch by installed package name.
- Do not use `open <apk|aab> --relaunch`; remote runtime hints are applied through the installed app sandbox.

## Lease flow example

```bash
export AGENT_DEVICE_DAEMON_BASE_URL=<trusted-daemon-base-url>
export AGENT_DEVICE_DAEMON_AUTH_TOKEN=<token>

agent-device \
  --tenant acme \
  --session-isolation tenant \
  --run-id run-123 \
  --lease-id <lease-id> \
  session list --json
```

Low-level lease operations exist for host-side automation, but do not point them at arbitrary hosts. The remote daemon executes device-control commands, so only use a trusted daemon base URL and an auth token managed by the same operator boundary.

Lease lifecycle methods exposed by the daemon:

- `agent_device.lease.allocate`
- `agent_device.lease.heartbeat`
- `agent_device.lease.release`
- `agent_device.command`

## Transport prerequisites

- Start the daemon in HTTP mode with `AGENT_DEVICE_DAEMON_SERVER_MODE=http|dual`.
- Point the client at the remote host with `AGENT_DEVICE_DAEMON_BASE_URL=http(s)://host:port[/base-path]`.
- For non-loopback remote hosts, set `AGENT_DEVICE_DAEMON_AUTH_TOKEN` or `--daemon-auth-token`. The client rejects non-loopback remote daemon URLs without auth.
- Direct JSON-RPC callers can authenticate with request params, `Authorization: Bearer <token>`, or `x-agent-device-token`.
- Prefer an auth hook such as `AGENT_DEVICE_HTTP_AUTH_HOOK` when the host needs caller validation or tenant injection.

## Lease lifecycle

Use JSON-RPC methods on `POST /rpc`:

- `agent_device.lease.allocate`
- `agent_device.lease.heartbeat`
- `agent_device.lease.release`

Keep the lease alive for the duration of the run and release it when the tenant-scoped work is complete.

Host-level lease knobs:

- `AGENT_DEVICE_MAX_SIMULATOR_LEASES`
- `AGENT_DEVICE_LEASE_TTL_MS`
- `AGENT_DEVICE_LEASE_MIN_TTL_MS`
- `AGENT_DEVICE_LEASE_MAX_TTL_MS`

## Command admission contract

For tenant-isolated command execution, pass all four CLI flags together:

```bash
agent-device \
  --tenant acme \
  --session-isolation tenant \
  --run-id run-123 \
  --lease-id <lease-id> \
  session list --json
```

The CLI sends `AGENT_DEVICE_DAEMON_AUTH_TOKEN` in both the JSON-RPC request token field and HTTP auth headers so existing daemon auth paths continue to work.

## Failure semantics and trust notes

- Missing tenant, run, or lease fields in tenant-isolation mode should fail as `INVALID_ARGS`.
- Inactive or scope-mismatched leases should fail as `UNAUTHORIZED`.
- Inspect logs on the remote host during remote debugging. Client-side `--debug` does not tail a local daemon log once `AGENT_DEVICE_DAEMON_BASE_URL` is set.
- Do not point `AGENT_DEVICE_DAEMON_BASE_URL` at untrusted hosts. Remote daemon requests can launch apps and execute interaction commands.
- Treat daemon auth tokens and lease identifiers as sensitive operational data.
