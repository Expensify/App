import {useEffect, useRef} from 'react';
import Timing from '../libs/actions/Timing';

export default function useTiming(eventName) {
    const isComponentMounted = useRef(false);
    if (!isComponentMounted.current) {
        Timing.start(eventName);
    }

    useEffect(() => {
        Timing.end(eventName);
        isComponentMounted.current = true;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
