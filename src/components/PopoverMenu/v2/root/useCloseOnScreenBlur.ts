import {NavigationContext} from '@react-navigation/core';
import {use, useEffect} from 'react';

/** Soft — no-ops outside a `<NavigationContainer>` so tests / Storybook / isolated renders don't crash. */
function useCloseOnScreenBlur(setIsVisible: (visible: boolean) => void): void {
    const navigation = use(NavigationContext);
    useEffect(() => {
        if (!navigation) {
            return undefined;
        }
        return navigation.addListener('blur', () => setIsVisible(false));
    }, [navigation, setIsVisible]);
}

export default useCloseOnScreenBlur;
