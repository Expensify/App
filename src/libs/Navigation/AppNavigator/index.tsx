import React, {lazy, Suspense} from 'react';
import type {ComponentProps} from 'react';
import lazyRetry from '@src/utils/lazyRetry';

const AppNavigator = lazy(() => lazyRetry(() => import(/* webpackChunkName: "appNavigator.prefetch" */ './AppNavigator')));

function AppNavigatorLoader({authenticated}: ComponentProps<typeof AppNavigator>) {
    return (
        <Suspense fallback={null}>
            <AppNavigator authenticated={authenticated} />
        </Suspense>
    );
}

export default AppNavigatorLoader;
