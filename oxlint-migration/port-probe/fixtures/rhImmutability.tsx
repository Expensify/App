// rc/immutability: reassigning a local from a callback, which runs after render has completed. The
// reassignment produces TWO findings on both tools -- "cannot reassign variable after render" for the
// assignment and "cannot modify local variables after render" for the escaping function.
//
// Deliberately on one line, which is the only reason this row can be at parity. The two engines pick
// different primary locations for the second finding: ESLint's JavaScript compiler anchors it on the
// function that escapes, the Rust compiler anchors it on the modification site and does not carry the
// escape location at all. On one line both anchors land on the same line, so the comparison (which
// keys on file + line) agrees. The divergence itself is recorded, with the multi-line shape this
// fixture used to have, in oxlint-migration/native-vs-sidecar-probe/ImmutabilityAnchor.tsx and
// asserted by `npm run oxlint-react-compiler-rust`.
//
// This directory is in .oxfmtrc.json's ignorePatterns, so the formatter will not split the line.
export function ReassignsAfterRender() {
    let latest = 0;
    return <button onClick={() => { latest = 1; }}>{latest}</button>;
}
