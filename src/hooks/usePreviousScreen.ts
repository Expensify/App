import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

function usePreviousScreen(): () => boolean {
    const previousScreen = useRef<string | undefined>(undefined);
    const navigation = useNavigation();

    const isOnPreviousScreen = useCallback(() => {
        return previousScreen.current === Navigation.getActiveRouteWithoutParams();
    }, []);

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            if (previousScreen.current !== undefined) {
                return;
            }
            previousScreen.current = Navigation.getActiveRouteWithoutParams();
        });
    }, []);

    useEffect(() => {
        return navigation.addListener('blur', () => {
            // We don't really change screen when we open an attachment
            if (Navigation.getActiveRouteWithoutParams() === `/${ROUTES.ATTACHMENTS.route}`) {
                return;
            }
            previousScreen.current = Navigation.getActiveRouteWithoutParams();
        });
    }, [navigation]);

    return isOnPreviousScreen;
}

export default usePreviousScreen;
