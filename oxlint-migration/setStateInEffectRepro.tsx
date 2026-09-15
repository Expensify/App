// Minimal reproducer for the react-hooks/set-state-in-effect gap in the rc/ bridge
// (OXLINT_MIGRATION_STATE section 5.2). Note what this is NOT: a detection gap. Oxlint's own native
// react/set-state-in-effect reports this file correctly. What cannot see it is the rc/ bridge, which
// reads diagnostics out of transformSync's `result.errors` -- a list that only ever carries fatal
// diagnostics (oxc-project/oxc#26128, tracked as #26318). A finding the compiler does not classify
// as panic-worthy never becomes fatal, so it never arrives. Repo-wide that costs 80 of ESLint's 127
// findings, across 67 of the 99 files where ESLint reports the rule.
//
// Sibling of oxc-project/oxc#26277, which is why the bridge exists at all: on the native path a
// disable-next-line naming react/exhaustive-deps suppresses every React Compiler diagnostic in the
// enclosing component, and this repo has 228 such comments.
//
// ESLint, reports line 34:
//   npx eslint --no-config-lookup -c <config enabling only react-hooks/set-state-in-effect> \
//       --no-ignore oxlint-migration/setStateInEffectRepro.tsx
//   -> "Calling setState synchronously within an effect can trigger cascading renders"
//
// Oxlint native, also reports it -- run from the repo root with a copy outside oxlint-migration/
// (that path is in ignorePatterns):
//   echo '{"plugins":["react"],"rules":{"react/set-state-in-effect":"error"}}' > c.tmp.json
//   cp oxlint-migration/setStateInEffectRepro.tsx repro.tmp.tsx
//   npx oxlint -c c.tmp.json repro.tmp.tsx      -> react(set-state-in-effect)
//
// The rc/ bridge, reports nothing:
//   node -e "import('./config/oxlint/reactCompilerRust.mjs').then(async (m) => { const fs =
//       await import('node:fs'); const f = 'oxlint-migration/setStateInEffectRepro.tsx';
//       console.log(m.reactCompilerDiagnostics(f, fs.readFileSync(f, 'utf8'))); })"
//   -> []
import React, {useEffect, useState} from 'react';

export function SetsStateInEffect(): React.JSX.Element {
    const [value, setValue] = useState(0);
    useEffect(() => {
        setValue(1);
    }, []);
    return <div>{value}</div>;
}
