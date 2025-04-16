import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

function useIsOnInitialRenderReportScreen(): () => boolean {
    const initialRenderReportScreen = useRef<string | undefined>(undefined);
    const navigation = useNavigation();

    const isOnInitialRenderReportScreen = useCallback(() => {
        return initialRenderReportScreen.current === Navigation.getActiveRouteWithoutParams();
    }, []);

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            if (initialRenderReportScreen.current !== undefined) {
                return;
            }
            initialRenderReportScreen.current = Navigation.getActiveRouteWithoutParams();
        });
    }, []);

    useEffect(() => {
        return navigation.addListener('blur', () => {
            // We don't really change screen when we open an attachment
            if (Navigation.getActiveRouteWithoutParams() === `/${ROUTES.ATTACHMENTS.route}`) {
                return;
            }
            initialRenderReportScreen.current = Navigation.getActiveRouteWithoutParams();
        });
    }, [navigation]);

    return isOnInitialRenderReportScreen;
}

export default useIsOnInitialRenderReportScreen;
