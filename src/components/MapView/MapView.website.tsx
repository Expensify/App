import React, {lazy, Suspense, useEffect, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import ActivityIndicator from '@components/ActivityIndicator';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import type {MapViewProps} from './MapViewTypes';
import PendingMapView from './PendingMapView';

const MapViewImpl = lazy(() => import('./MapViewImpl.website'));

function MapView({ref, ...props}: MapViewProps) {
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
                    <ActivityIndicator
                        size="large"
                        style={[styles.h100]}
                    />
                }
            >
                {!isOffline ? (
                    <MapViewImpl
                        ref={ref}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                    />
                ) : (
                    <PendingMapView
                        title={translate('distance.mapPending.title')}
                        subtitle={translate('distance.mapPending.subtitle')}
                        style={styles.mapEditView}
                    />
                )}
            </Suspense>
        </ErrorBoundary>
    );
}

export default MapView;
