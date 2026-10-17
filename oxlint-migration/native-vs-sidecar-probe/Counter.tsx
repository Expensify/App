import {useEffect, useRef, useState} from 'react';

function Counter({start}: {start: number}) {
    const [count, setCount] = useState(start);
    const ref = useRef(0);

    // BUG A: reading a ref while rendering.
    const doubled = ref.current * 2;

    // BUG B: calling setState straight from an effect.
    useEffect(() => {
        setCount(start);
    }, [start]);

    // Not a bug we care about here. One missing dependency, silenced the normal way.
    useEffect(() => {
        console.log(count);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div>{doubled}</div>;
}

export default Counter;
