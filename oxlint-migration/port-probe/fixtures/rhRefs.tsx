// rh/refs: reading ref.current during render.
import {useRef} from 'react';

export function ReadsRefInRender() {
    const ref = useRef(0);
    return <div>{ref.current}</div>;
}
