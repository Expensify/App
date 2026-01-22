import React, {memo} from 'react';
import AuthScreens from './AuthScreens';
import PublicScreens from './PublicScreens';

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    if (authenticated) {
        return <AuthScreens />;
    }

    return <PublicScreens />;
}

export default memo(AppNavigator);
