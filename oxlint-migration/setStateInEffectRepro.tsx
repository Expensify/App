// Minimal reproducer for the react-hooks/set-state-in-effect detection gap (OXLINT_MIGRATION_STATE
// section 5.2). eslint-plugin-react-hooks reports line 20; oxc-transform-react's React Compiler
// reports nothing, on this and on 67 of the 99 files where ESLint finds the rule repo-wide.
//
// ESLint side:
//   npx eslint --no-config-lookup -c <a config enabling only react-hooks/set-state-in-effect> \
//       --no-ignore oxlint-migration/setStateInEffectRepro.tsx
//   -> 1 error, "Calling setState synchronously within an effect can trigger cascading renders"
//
// Oxlint side, through the same bridge the rc/* plugin uses:
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
