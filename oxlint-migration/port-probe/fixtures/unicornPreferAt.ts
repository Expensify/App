// Tripwire fixture for unicorn/prefer-at at production's default options. The repo has two real findings for
// this rule (both `x[x.length - 1]`) but no `x.slice(-1)[0]`, which is the shape
// INVESTIGATION DOCS/OXLINT_MIGRATION_INVESTIGATION.md records as an upstream bug: oxlint used to report it
// twice for one violation (oxc#27746 item 6). Fixed in oxlint 1.89.0 (oxc#27762); this fixture is the
// regression tripwire for that shape.

const numbers = [1, 2, 3];

// Control: the shape the rule asks for.
const lastWithAt = numbers.at(-1);

// The violation.
const lastWithSlice = numbers.slice(-1)[0];

export const preferAtMarker = [lastWithAt, lastWithSlice];

// Two exports on purpose: the probe's base config enables prefer-default-export for every file, and a
// single-export file draws an extra finding from oxlint that ESLint does not see on a .ts fixture.
export const preferAtNumbers = numbers;
