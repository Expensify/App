import {useEffect, useState} from 'react';

type ThrottledButtonState = [boolean, () => void];

export default function useThrottledButtonState(): ThrottledButtonState {
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
