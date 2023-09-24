import {useEffect, useState} from 'react';

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
