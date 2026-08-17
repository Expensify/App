# `eslint-seatbelt` patches

### [eslint-seatbelt+0.1.3+001+thread-safety.patch](eslint-seatbelt+0.1.3+001+thread-safety.patch)

- Reason:

    ```
    Without this, running `npm run lint` with `--concurrency=auto` races on
    the atomic rename of the TSV and crashes with:
      ENOENT: no such file or directory, rename '.../eslint.seatbelt.tsv.wip*.tmp'
      -> 'config/eslint/eslint.seatbelt.tsv'
    Falling back to `--concurrency=1` is too slow for this repo.
    ```

- Upstream PR/issue: https://github.com/justjake/eslint-seatbelt/pull/27
- E/App issue: N/A
- PR introducing patch: https://github.com/Expensify/App/pull/88566

### [eslint-seatbelt+0.1.3+002+read-only.patch](eslint-seatbelt+0.1.3+002+read-only.patch)

- Reason:

    Adds a `readOnly` config option (and `SEATBELT_READ_ONLY` env var) that causes
    `eslint-seatbelt` to still read and validate the seatbelt file, but never
    write updates back to disk. We enable this in developer worktrees
    (`readOnly: !process.env.CI` in `config/eslint/eslint.config.mjs`) so
    fixing baselined errors doesn't dirty the worktree with an unrelated TSV
    rewrite. In CI, the setting is off so the `push: main` lint job can
    auto-commit tightenings back to `main` as OSBotify (see
    [`.github/workflows/lint.yml`](../../.github/workflows/lint.yml)).

    Precedence:
    - `SEATBELT_READ_ONLY` env var overrides the setting.
    - `SEATBELT_INCREASE` overrides `readOnly` (intentional loosening still writes).
    - `SEATBELT_DISABLE` short-circuits both.
    - `SEATBELT_FROZEN` remains orthogonal.

- Upstream PR/issue: https://github.com/justjake/eslint-seatbelt/pull/29
- E/App issue: N/A
- PR introducing patch: https://github.com/Expensify/App/pull/88566

### [eslint-seatbelt+0.1.3+003+readonly-type-declarations.patch](eslint-seatbelt+0.1.3+003+readonly-type-declarations.patch)

- Reason:

    Patch 002 added the `readOnly` config option to the runtime and to `README.md`,
    but never added it to the `SeatbeltConfig` TypeScript interface, so `SeatbeltConfig`
    and the derived `SeatbeltArgs` type didn't know about it. Any consumer of
    `eslint-seatbelt/api` that reads or sets `readOnly` (e.g. `scripts/lint.ts`, which
    prunes baseline rows for deleted files using the same readOnly semantics as the rest
    of the seatbelt baseline) failed to typecheck. This adds the missing `readOnly?: boolean`
    field to both the `.d.ts` and `.d.mts` copies of the interface, matching the JSDoc
    already shipped in `README.md` by patch 002.

- Upstream PR/issue: N/A (the `readOnly` option itself is an Expensify-only patch, not upstream)
- E/App issue: N/A
- PR introducing patch: https://github.com/Expensify/App/pull/98665
