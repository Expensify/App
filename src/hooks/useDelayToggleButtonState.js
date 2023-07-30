import {useState, useEffect, useRef} from 'react';

/**
 * Hook that manages a delayed toggle button state.
 *
 * @returns {Object} - An object containing isDelayButtonStateComplete and toggleDelayButtonState.
 */
export default function useDelayToggleButtonState() {
    // State to hold the button completion status
    const [isDelayButtonStateComplete, setIsDelayButtonStateComplete] = useState(false);
    // Ref to hold the identifier of the setTimeout function
    const resetButtonStateCompleteTimer = useRef(null);

    /**
     * Function to toggle the button state.
     * It sets the button state to complete and after 1.8s, reverts it to incomplete.
     */
    function toggleDelayButtonState() {
        setIsDelayButtonStateComplete(true);
        resetButtonStateCompleteTimer.current = setTimeout(() => {
            setIsDelayButtonStateComplete(false);
        }, 1800);
    }

    /**
     * Effect to clean up the timer when the component unmounts.
     */
    // eslint-disable-next-line arrow-body-style
    useEffect(() => {
        return () => {
            if (!resetButtonStateCompleteTimer.current) {
                return;
            }
            clearTimeout(resetButtonStateCompleteTimer.current);
        };
    }, []);

    return {isDelayButtonStateComplete, toggleDelayButtonState};
}
