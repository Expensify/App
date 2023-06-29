import {useEffect, useState, useRef, useCallback} from 'react';

/**
 * @returns {Array}
 */
export default function useDelayToggleButtonState() {
    const [isDelayButtonStateComplete, setIsDelayButtonStateComplete] = useState(false);

    const resetButtonStateCompleteTimer = useRef(null);
    useEffect(() => () => {
        if (!resetButtonStateCompleteTimer.current) {
            return;
        }
        clearTimeout(resetButtonStateCompleteTimer.current);
    });

    const toggleDelayButtonState = useCallback((resetAfterDelay) => {
        setIsDelayButtonStateComplete(true);
        if (!resetAfterDelay) {
            return;
        }
        resetButtonStateCompleteTimer.current = setTimeout(() => {
            setIsDelayButtonStateComplete(false);
        }, 1800);
    }, []);

    return [isDelayButtonStateComplete, toggleDelayButtonState];
}
