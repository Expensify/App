import {useState, useEffect, useCallback} from 'react';

export default function useDelayToggleButtonState() {
    const [isDelayButtonStateComplete, setIsDelayButtonStateComplete] = useState(false);
    const toggleDelayButtonState = useCallback(() => setIsDelayButtonStateComplete(true), []);

    useEffect(() => {
        if (!isDelayButtonStateComplete) {
            return;
        }

        const timer = setTimeout(() => {
            setIsDelayButtonStateComplete(false);
        }, 1800);
        return () => clearTimeout(timer);
    }, [isDelayButtonStateComplete]);

    return {isDelayButtonStateComplete, toggleDelayButtonState};
}
