// The one anchor divergence the Rust React Compiler port carries, kept as its own probe because the
// fixture it came from could not both stay multi-line and stay at parity.
//
// `react-hooks/immutability` reports this shape TWICE on both tools, and both agree on the first
// finding: "Cannot reassign variable after render completes", on the `latest = 1;` line, column 9.
// The second, "Cannot modify local variables after render completes", is where they part. Measured
// 2026-08-21 on this file, ESLint through oxlint-migration/port-probe/eslint.fixtures.config.mjs and
// oxlint through oxlint-migration/rc-rust-probe.oxlintrc.json (line numbers are quoted as landmarks
// rather than absolutes, because editing this header would move them):
//
//   ESLint (JavaScript compiler)  the `onClick={onSelect}` line, column 29 -- the reference passed
//                                 as a JSX prop, i.e. the site where the function escapes render
//   rc/*   (Rust compiler)        the `latest = 1;` line, column 9 -- the modification site again,
//                                 carrying the arrow declaration as a secondary label and the escape
//                                 site nowhere at all
//
// So the location ESLint anchors on is not present in the Rust diagnostic at all, which is why this
// is a recorded divergence rather than a mapping bug in config/oxlint/reactCompilerRust.mjs: there is
// no label to anchor on. Repo impact, measured 2026-08-21: 7 rc/immutability findings whole-repo.
// Asserted by `npm run oxlint-react-compiler-rust`, so a future oxc-transform-react bump that
// changes the anchor shows up as a failing assertion rather than as parity drift.
//
// rh/immutability: reassigning a local from a callback, which runs after render has completed.
export function ReassignsAfterRender() {
    let latest = 0;
    const onSelect = () => {
        latest = 1;
    };
    return <button onClick={onSelect}>{latest}</button>;
}
