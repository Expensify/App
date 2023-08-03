import {useEffect, useState} from 'react';

/**
 * @param {Function} callback
 * @returns {Array}
 */
export default function useThrottledButtonState(callback = null) {
    const [isButtonActive, setIsButtonActive] = useState(true);

    useEffect(() => {
        if (isButtonActive) {
            return;
        }

        const timer = setTimeout(() => {
            setIsButtonActive(true);
            if (callback) callback();
        }, 1800);

        return () => clearTimeout(timer);
    }, [callback, isButtonActive]);

    return [isButtonActive, () => setIsButtonActive(false)];
}
