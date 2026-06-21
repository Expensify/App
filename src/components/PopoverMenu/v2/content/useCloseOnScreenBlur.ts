import {NavigationContext} from '@react-navigation/core';
import {use, useEffect} from 'react';

function useCloseOnScreenBlur(close: () => void, isOpen: boolean): void {
    const navigation = use(NavigationContext);
    useEffect(() => {
        if (!navigation || !isOpen) {
            return undefined;
        }
        return navigation.addListener('blur', () => {
            if (navigation.isFocused()) {
                return;
            }
            close();
        });
    }, [navigation, close, isOpen]);
}

export default useCloseOnScreenBlur;
