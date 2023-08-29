import {useEffect, useState} from 'react';

/**
 * @returns {Array}
 */
export default function useThrottledButtonState() {
    const [isButtonActive, setIsButtonActive] = useState(true);

    useEffect(() => {
        if (isButtonActive) {
            return;
        }

        const timer = setTimeout(() => {
            setIsButtonActive(true);
        }, 1800);

        return () => clearTimeout(timer);
    }, [isButtonActive]);

    return [isButtonActive, () => setIsButtonActive(false)];
}
