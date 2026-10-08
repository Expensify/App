// rh/set-state-in-render: setting state in the render body, which can loop forever.
import {useState} from 'react';

export function SetStateWhileRendering() {
    const [count, setCount] = useState(0);
    setCount(count + 1);
    return <div>{count}</div>;
}
