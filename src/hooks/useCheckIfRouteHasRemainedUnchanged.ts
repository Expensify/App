import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

/**
 * Hook that returns a function to check if the currently active route remains the same as the last known route.
 * The last known route reference is updated every time the component experiences a 'blur' event,
 * except when opening an attachments modal, which is treated as an exception and does not trigger a reference update.
 *
 * @return Function that checks if the last known route matches the currently active route.
 */
function useCheckIfRouteHasRemainedUnchanged(): () => boolean {
    const lastKnownRouteRef = useRef<string | undefined>(undefined);
    const navigation = useNavigation();

    // Function to compare the last known route with the current active route
    const hasRouteRemainedUnchanged = useCallback(() => {
        return lastKnownRouteRef.current === Navigation.getActiveRouteWithoutParams();
    }, []);

    // Initialize the initial route when navigation is ready
    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            if (lastKnownRouteRef.current !== undefined) {
                return;
            }

            lastKnownRouteRef.current = Navigation.getActiveRouteWithoutParams();
        });
    }, []);

    // Update the route reference on 'blur' events, except when opening attachments modal
    useEffect(() => {
        return navigation.addListener('blur', () => {
            const currentRoute = Navigation.getActiveRouteWithoutParams();
            if (currentRoute === `/${ROUTES.ATTACHMENTS.route}`) {
                // Skip route update when attachment modal is opened
                return;
            }
            lastKnownRouteRef.current = currentRoute;
        });
    }, [navigation]);

    return hasRouteRemainedUnchanged;
}

export default useCheckIfRouteHasRemainedUnchanged;
