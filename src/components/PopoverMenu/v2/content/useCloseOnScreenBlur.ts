import {NavigationContext} from '@react-navigation/core';
import {use, useEffect} from 'react';

/** Soft-reads `NavigationContext`; no-ops when rendered outside a `<NavigationContainer>`. */
function useCloseOnScreenBlur(close: () => void): void {
    const navigation = use(NavigationContext);
    useEffect(() => {
        if (!navigation) {
            return undefined;
        }
        return navigation.addListener('blur', close);
    }, [navigation, close]);
}

export default useCloseOnScreenBlur;
