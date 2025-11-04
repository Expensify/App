import {useNavigationState} from '@react-navigation/native';
import React, {lazy, memo, Suspense, useEffect} from 'react';
import useCurrentReportID from '@hooks/useCurrentReportID';
import lazyRetry from '@src/utils/lazyRetry';

const AuthScreens = lazy(() => lazyRetry(() => import('./AuthScreens')));
const PublicScreens = lazy(() => lazyRetry(() => import('./PublicScreens')));

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const currentReportIDValue = useCurrentReportID();
    const currentReportID = useNavigationState((state) => currentReportIDValue?.getCurrentReportID(state));

    useEffect(() => {
        currentReportIDValue?.updateCurrentReportID(currentReportID);

        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run the effect on currentReportID change.
    }, [currentReportID]);

    if (authenticated) {
        // These are the protected screens and only accessible when an authToken is present
        return (
            <Suspense fallback={null}>
                <AuthScreens />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={null}>
            <PublicScreens />
        </Suspense>
    );
}

AppNavigator.displayName = 'AppNavigator';

export default memo(AppNavigator);
