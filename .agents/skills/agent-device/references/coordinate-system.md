# Coordinate System

## When to open this file

Open this file only when you must use raw coordinates instead of selectors or `@ref` targeting.

## Main commands to reach for first

- `screenshot`
- coordinate-based `click` or `swipe`

## Most common mistake to avoid

Do not assume coordinates mean the same thing across platforms or runs. Prefer selectors and refs first.

## Canonical loop

```bash
agent-device screenshot /tmp/current-screen.png
agent-device click 120 240
```

## Rules

- Origin is the top-left of the device screen.
- iOS uses device points.
- Android uses pixels.
- Use screenshots to reason about coordinates before acting.
