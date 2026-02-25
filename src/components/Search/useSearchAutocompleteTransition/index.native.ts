import React, {useDeferredValue, useEffect} from 'react';
import Navigation from '@libs/Navigation/Navigation';

/**
 * This hook delays component render by creating a state that only updates when the navigation is ready.
 * As we wait for the navigation, it smoothly opens the SearchRouter and allows the selection list to render.
 */
function useSearchAutocompleteTransition() {
    const [shouldRender, setShouldRender] = React.useState(false);
    const deferredValue = useDeferredValue(shouldRender);

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            setShouldRender(true);
        });
    }, []);

    return deferredValue;
}

export default useSearchAutocompleteTransition;
