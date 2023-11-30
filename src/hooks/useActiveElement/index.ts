import {useEffect, useState} from 'react';

/**
 * Listens for the focusin and focusout events and sets the DOM activeElement to the state.
 * On native, we just return null.
 *
 * @return {Element} the active element in the DOM
 */
export default function useActiveElement() {
    const [active, setActive] = useState(document.activeElement);

    const handleFocusIn = () => {
        setActive(document.activeElement);
    };

    const handleFocusOut = () => {
        setActive(null);
    };

    useEffect(() => {
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('focusout', handleFocusOut);
        };
    }, []);

    return active;
}
