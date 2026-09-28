# Evals

Offline evals for the parts of our tooling that ask an LLM to make a judgment call. Unlike the unit
tests, these call the real OpenAI API and cost real tokens, so **they do not run in CI**. Run them by
hand when changing a prompt, a model, or a threshold.

## Running them

```bash
export PROPOSAL_POLICE_API_KEY=sk-...
npm run eval:proposal-police
```

Without the key the suite fails rather than skipping. A skip reads as a pass, and the only reason to
run these at all is deliberate.

Two things about the wiring are load-bearing and easy to break:

- **Filenames must contain `.test`.** Bun only discovers `.test`, `_test_`, `.spec`, and `_spec_`.
  A file named `commentIntent.eval.ts` is silently never run.
- **The npm script passes a `./`-prefixed path with a trailing slash.** `bunfig.toml` sets
  `[test] root = "server"`, so a bare `bun test evals/…` searches only `server/` and matches nothing.
  The `./` prefix makes Bun treat the argument as a path rather than a filter.
- **The npm script overrides `--path-ignore-patterns`.** `bunfig.toml` ignores `**/evals/**` so that
  widening that root later can't sweep token-spending evals into CI — but that ignore applies to
  explicit paths too, so running the evals on purpose means overriding it with a pattern that matches
  nothing.

`evals/` has its own `tsconfig.json` rather than joining the root project, because `@types/bun`'s
globals conflict with the app's. It isn't in the set of projects `npm run typecheck` gates on, so typecheck it with `npm run typecheck -- evals`.

## ProposalPolice

Covers the three calls in `.github/actions/javascript/proposalPoliceComment` that need judgment.
Whether a comment follows the proposal template is decided in code by `isProposal`, so it needs no
eval — `tests/unit/ProposalUtilsTest.ts` covers it for free.

| Suite | What it guards |
| --- | --- |
| `commentIntent` | Spam vs a genuine attempt vs ordinary discussion |
| `duplicateCheck` | Similarity scoring, and which prior proposal gets named |
| `editCheck` | Substantial vs minor edits to a proposal |

**Every fixture runs 3 times and is judged on the majority.** The model varies between runs, and an
eval that asserts one exact value per fixture flakes until people start ignoring it.

Two assertions are deliberately stricter than the majority rule:

- A `NOT_AN_ATTEMPT` fixture must not come back `SPAM` in *any* run. That is the failure that collapses
  a real contributor's comment, and unlike everything else here it isn't undone by the next run.
- Duplicate scores are asserted by **which side of `DUPLICATE_SIMILARITY_THRESHOLD` they land on**,
  never as an exact number, because only the side changes what the bot does.

### The fixtures

Harvested from real issues where ProposalPolice actually intervened, so these are production inputs
rather than cases written to pass. `origin` records how each one was obtained:

| `origin` | Meaning |
| --- | --- |
| `harvested` | Verbatim production text |
| `assembled` | Real bodies, paired by hand |
| `constructed` | Hand-written, because no clean real example exists |

Read `note` before trusting a fixture — it says what the case is and why it carries the label it does.

The intent set is deliberately weighted the way the real population is (12 `NOT_AN_ATTEMPT`, 4 `SPAM`,
4 `GENUINE_ATTEMPT`) rather than balanced across classes, so a classifier that over-predicts spam shows
up as a failure instead of being averaged away.

### Anonymization

This repository is public and the intent labels include `SPAM`, so a fixture must never read as a
public accusation against a named contributor. Fixtures carry no source URLs, no real GitHub comment
IDs, and no real logins — authors become obviously-fictional stand-ins, keeping same-author and
different-author relationships intact within a fixture because duplicate detection depends on them.

`sourceHash` exists only so the harvester can report which candidates aren't labelled yet.

### Adding fixtures

```bash
bun ./scripts/harvestProposalPoliceEvals.ts --set=commentIntent --issues=25
```

The harvester only ever writes to the gitignored `fixtures/harvested/` directory, and reports which
candidates aren't yet in the labelled files. Copy one across by hand, replace its `sourceUrl` with the
`sourceHash`, and fill in the expected outcome. A re-harvest can never clobber a label you applied.
