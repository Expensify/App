import {useEffect, useState} from 'react';

export default function useThrottledButtonState(): [boolean, () => void] {
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
