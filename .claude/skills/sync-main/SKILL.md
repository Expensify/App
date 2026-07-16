---
name: sync-main
description: Pull latest main into the current branch. Use when the user wants to sync, update, or catch up a branch with upstream main, or says "sync main", "pull main", "update my branch", or runs /sync-main. Handles the stale package-lock fast-forward blocker by discarding only the lockfile change while preserving all other local work.
---

Pull latest main into the current branch. If a fast-forward is blocked by a stale package-lock change, discard only that lockfile change, complete the merge, and preserve all other local work.
