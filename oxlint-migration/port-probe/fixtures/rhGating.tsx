// rh/gating: with dynamic gating configured (both fixture configs point it at a source module), a
// component can ask to be gated with a `use memo if(...)` directive. The name in the parentheses has
// to be a JavaScript identifier, and this one is not.
import {useState} from 'react';

export function GatedComponent() {
    'use memo if(not an identifier)';

    const [value] = useState(0);
    return <div>{value}</div>;
}
