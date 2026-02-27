import React, {memo, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const [hybridApp] = useOnyx(ONYXKEYS.HYBRID_APP, {canBeMissing: true});

    const shouldShowAuthScreens = useMemo(() => {
        if (!CONFIG.IS_HYBRID_APP) {
            return authenticated;
        }

        return authenticated && hybridApp?.readyToShowAuthScreens;
    }, [hybridApp?.readyToShowAuthScreens, authenticated]);

    if (shouldShowAuthScreens) {
        const AuthScreens = require<ReactComponentModule>('./AuthScreens').default;

        // These are the protected screens and only accessible when an authToken is present
        return <AuthScreens />;
    }

    const PublicScreens = require<ReactComponentModule>('./PublicScreens').default;

    return <PublicScreens />;
}

export default memo(AppNavigator);
