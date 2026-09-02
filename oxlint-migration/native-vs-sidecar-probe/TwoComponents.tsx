import {useEffect, useRef, useState} from 'react';

// COMPONENT A: carries the disable comment AND a bug.
function Dirty({start}) {
    const [count, setCount] = useState(start);
    const refA = useRef(0);
    const doubledA = refA.current * 2; // BUG A1: ref read during render

    useEffect(() => {
        console.log(count);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return doubledA;
}

// COMPONENT B: completely clean of comments, but has the same kind of bug.
function Clean({start}) {
    const [value, setValue] = useState(start);
    const refB = useRef(0);
    const doubledB = refB.current * 2; // BUG B1: ref read during render

    useEffect(() => {
        setValue(start); // BUG B2: setState in effect
    }, [start]);

    return doubledB + value;
}

export {Dirty, Clean};
