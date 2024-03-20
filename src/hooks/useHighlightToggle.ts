import {useEffect, useRef, useState} from 'react';
import CONST from '@src/CONST';

/**
 * Returns a toggle that gets un-toggled after the specified time delay has elapsed.
 * This is used for toggling a highlight effect on a component.
 */
export default function useHighlightToggle(shouldToggle: boolean, delay: number = CONST.ANIMATED_TRANSITION) {
    const toggleTimeoutRef = useRef<NodeJS.Timeout>();
    const [toggle, setToggle] = useState(false);

    useEffect(() => {
        if (!shouldToggle) {
            return;
        }

        setToggle(true);

        toggleTimeoutRef.current = setTimeout(() => {
            setToggle(false);
        }, delay);
    }, [shouldToggle, delay]);

    useEffect(() => () => toggleTimeoutRef.current && clearTimeout(toggleTimeoutRef.current), []);

    return toggle;
}
