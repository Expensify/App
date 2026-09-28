import {isSidebarScreenName} from '@libs/Navigation/helpers/isNavigatorName';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';

import {useSyncExternalStore} from 'react';

/** On a wide layout a split navigator's sidebar is shown beside its focused screen, so it can be seen without ever being focused. */
function useIsSidebarOfFocusedSplitNavigator(routeName: string | undefined, navigation: Pick<NavigationProp<ParamListBase>, 'getParent'>): boolean {
    const splitNavigation = isSidebarScreenName(routeName) ? navigation.getParent() : undefined;
    return useSyncExternalStore(
        (onChange) => {
            if (!splitNavigation) {
                return () => {};
            }
            const unsubscribeFocus = splitNavigation.addListener('focus', onChange);
            const unsubscribeBlur = splitNavigation.addListener('blur', onChange);
            return () => {
                unsubscribeFocus();
                unsubscribeBlur();
            };
        },
        () => !!splitNavigation?.isFocused(),
    );
}

export default useIsSidebarOfFocusedSplitNavigator;
