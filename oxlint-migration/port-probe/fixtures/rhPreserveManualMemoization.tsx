// rh/preserve-manual-memoization: the callback reads `outer.label` while the dependency list says
// `outer?.label`, so the compiler's inferred dependency does not match the manual one and it stops
// optimizing. That optional-chaining mismatch is the shape the repo's own violations have
// (src/pages/DynamicReportDetailsPage.tsx:247 among them).
//
// Two things this fixture cannot do without: the callback has to call something the compiler cannot
// fold away (a plain `String(...)` gets pruned, and a pruned memo has no memoization left to
// preserve), and the mismatch has to be the optional chain. A missing or extraneous dependency is
// reported by exhaustive-deps instead, and the compiler keeps going.
import {useMemo} from 'react';

type Outer = {label?: string};

function describe(value: unknown) {
    return String(value);
}

export function InferredDependencyMismatch({outer}: {outer: Outer}) {
    const label = useMemo(() => describe(outer.label), [outer?.label]);
    return <div>{label}</div>;
}
