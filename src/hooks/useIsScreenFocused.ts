import {NavigationContext} from '@react-navigation/native';
import {useContext, useSyncExternalStore} from 'react';

/** `useIsFocused` that returns `true` outside a NavigationContainer instead of throwing — safe for isolated test trees. */
function useIsScreenFocused(): boolean {
    const navigation = useContext(NavigationContext);
    return useSyncExternalStore(
        (callback) => {
            if (!navigation) {
                return () => {};
            }
            const unsubscribeFocus = navigation.addListener('focus', callback);
            const unsubscribeBlur = navigation.addListener('blur', callback);
            return () => {
                unsubscribeFocus();
                unsubscribeBlur();
            };
        },
        () => (navigation ? navigation.isFocused() : true),
        () => true,
    );
}

export default useIsScreenFocused;
