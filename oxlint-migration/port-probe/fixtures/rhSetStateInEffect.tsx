// rh/set-state-in-effect: setting state synchronously in an effect, which renders twice.
import {useEffect, useState} from 'react';

export function SetsStateInEffect() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        setCount(1);
    }, []);
    return <div>{count}</div>;
}
