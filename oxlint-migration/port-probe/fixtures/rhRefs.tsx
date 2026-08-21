// rh/refs: reading ref.current during render.
//
// The second effect is the property the whole Rust-compiler port turns on, not decoration. ESLint
// reports the ref read even though this component also carries an `eslint-disable-next-line
// react-hooks/exhaustive-deps` comment, and oxlint has to match it. oxlint's own native react/*
// rules refuse to report anything for a function containing such a comment, which is exactly why the
// 12 compiler rules run through config/oxlint/reactCompilerRust.mjs with `eslintSuppressionRules: []`
// instead of being switched on natively. Under the old rh/* sidecar this row passed for the wrong
// reason: the JavaScript compiler was never handed the option that arms the bail-out.
import {useEffect, useRef} from 'react';

export function ReadsRefInRender({label}: {label: string}) {
    const ref = useRef(0);

    useEffect(() => {
        console.log(label);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div>{ref.current}</div>;
}
