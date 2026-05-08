import {NavigationContext} from '@react-navigation/core';
import {use, useEffect} from 'react';

/** Soft-reads `NavigationContext` so isolated renders (tests / Storybook) don't crash. */
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
