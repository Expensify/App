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
