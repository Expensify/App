/** Reads the current screen's route without throwing outside a navigator screen, which `useRoute` does. */
import type {Route} from '@react-navigation/native';

import {NavigationRouteContext} from '@react-navigation/native';
import {createContext, useContext} from 'react';

// NavigationRouteContext is undefined when tests mock @react-navigation/native without re-exporting it, so a noop context keeps useContext valid.
const FallbackRouteContext = createContext<Route<string> | undefined>(undefined);

/** `undefined` when the caller renders outside a navigator screen. */
function useRouteFromContext(): Route<string> | undefined {
    return useContext(NavigationRouteContext ?? FallbackRouteContext);
}

export default useRouteFromContext;
