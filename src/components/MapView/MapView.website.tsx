import React, {forwardRef, lazy, Suspense, useEffect, useMemo, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import type {MapViewHandle} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import type {ComponentProps} from './types';

const MapView = forwardRef<MapViewHandle, ComponentProps>((props, ref) => {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [errorResetKey, setErrorResetKey] = useState(0);

    // Retry the error when reconnecting.
    const wasOffline = usePrevious(isOffline);
    useEffect(() => {
        if (!wasOffline || isOffline) {
            return;
        }
        setErrorResetKey((key) => key + 1);
    }, [isOffline, wasOffline]);

    // The only way to retry loading the module is to call `React.lazy` again.
    const MapViewImpl = useMemo(
        () => lazy(() => import('./MapViewImpl.website')),
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [errorResetKey],
    );

    return (
        <ErrorBoundary
            resetKeys={[errorResetKey]}
            fallback={
                <PendingMapView
                    title={isOffline ? translate('distance.mapPending.title') : translate('distance.mapPending.errorTitle')}
                    subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.errorSubtitle')}
                    style={styles.mapEditView}
                />
            }
        >
            <Suspense
                fallback={
                    <PendingMapView
                        title={translate('distance.mapPending.title')}
                        subtitle={translate('distance.mapPending.onlineSubtitle')}
                        style={styles.mapEditView}
                    />
                }
            >
                <MapViewImpl
                    // @ts-expect-error React.lazy loses type for ref.
                    ref={ref}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </Suspense>
        </ErrorBoundary>
    );
});

export default MapView;
