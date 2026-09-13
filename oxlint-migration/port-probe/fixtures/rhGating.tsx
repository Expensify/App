// UNUSED since 2026-08-21, kept as the recipe rather than deleted: react-hooks/gating is one of the
// two compiler rules oxlint dropped when the other 12 moved to rc/* over the Rust compiler (see the
// PORT_PLAN entries in oxlint-migration/ruleMap.py), so no manifest row names this file any more.
// Neither fixture config configures dynamic gating now, so nothing here reports on either tool.
//
// rh/gating: with dynamic gating configured (both fixture configs point it at a source module), a
// component can ask to be gated with a `use memo if(...)` directive. The name in the parentheses has
// to be a JavaScript identifier, and this one is not.
import {useState} from 'react';

export function GatedComponent() {
    'use memo if(not an identifier)';

    const [value] = useState(0);
    return <div>{value}</div>;
}
