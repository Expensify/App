import {useEffect, useState} from 'react';

type ThrottledButtonState = [boolean, () => void];

export default function useThrottledButtonState(onReset?: () => void): ThrottledButtonState {
    const [isButtonActive, setIsButtonActive] = useState(true);

    useEffect(() => {
        if (isButtonActive) {
            return;
        }

        const timer = setTimeout(() => {
            onReset?.();
            setIsButtonActive(true);
        }, 1800);

        return () => clearTimeout(timer);
    }, [isButtonActive, onReset]);

    return [isButtonActive, () => setIsButtonActive(false)];
}
