import {useEffect, useRef} from 'react';

/**
 * Listens for the focusin and focusout events and sets the DOM activeElement to the state.
 * On native, we just return null.
 *
 * @return {string | null} the active element in the DOM
 */
export default function useActiveElementRole() {
    const activeRoleRef = useRef(document.activeElement.role);

    const handleFocusIn = () => {
        activeRoleRef.current = document.activeElement.role;
    };

    const handleFocusOut = () => {
        activeRoleRef.current = null;
    };

    useEffect(() => {
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('focusout', handleFocusOut);
        };
    }, []);

    return activeRoleRef.current;
}
