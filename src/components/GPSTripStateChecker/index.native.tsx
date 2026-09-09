import ConfirmModal from '@components/ConfirmModal';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {resetGPSDraftDetails} from '@libs/actions/GPSDraftDetails';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';

import {BACKGROUND_LOCATION_TASK_OPTIONS, BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import {checkAndCleanGpsNotification, startGpsTripNotification} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {useSplashScreenState} from '@src/SplashScreenStateContext';

import {accountIDSelector} from '@selectors/Session';
import {hasStartedLocationUpdatesAsync, startLocationUpdatesAsync, stopLocationUpdatesAsync} from 'expo-location';
import React, {useEffect, useRef, useState} from 'react';

import useUpdateGpsNotification from './useUpdateGpsNotification';
import useUpdateGpsTripOnReconnect from './useUpdateGpsTripOnReconnect';

function GPSTripStateChecker() {
    const {translate} = useLocalize();
    const [showContinueTripModal, setShowContinueTripModal] = useState(false);
    const [gpsDraftDetails, gpsDraftDetailsMetadata] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const [currentAccountID, currentAccountIDResult] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const isSessionLoaded = currentAccountIDResult.status === 'loaded';
    const hasHandledAppRestart = useRef(false);
    const {isOffline} = useNetwork();

    const {splashScreenState} = useSplashScreenState();

    const reportID = gpsDraftDetails?.reportID ?? generateReportID();

    useUpdateGpsTripOnReconnect({gpsPoints: getGpsPoints(gpsDraftDetails)});
    useUpdateGpsNotification();

    // A trip started before this shipped records no accountID, so only a different one means another user.
    const isTripFromDifferentUser = isSessionLoaded && !!gpsDraftDetails?.accountID && gpsDraftDetails.accountID !== currentAccountID;

    useEffect(() => {
        if (!isTripFromDifferentUser) {
            return;
        }

        resetGPSDraftDetails();
        hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).then((isRunning) => {
            if (!isRunning) {
                return;
            }

            stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) =>
                console.error('[GPS distance request] Failed to stop tracking for a trip from another user', error),
            );
        });
    }, [isTripFromDifferentUser]);

    useEffect(() => {
        // Wait for the GPS_DRAFT_DETAILS subscription to hydrate before running the restart check once, so we don't
        // misread the not-yet-loaded state as "no trip" and wrongly stop an in-progress trip's background task.
        if (gpsDraftDetailsMetadata.status !== 'loaded' || hasHandledAppRestart.current) {
            return;
        }
        hasHandledAppRestart.current = true;

        async function handleGpsTripInProgressOnAppRestart() {
            await checkAndCleanGpsNotification();

            if (!gpsDraftDetails?.isTracking) {
                const isBackgroundTaskRunning = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME);
                if (isBackgroundTaskRunning) {
                    stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) =>
                        console.error('[GPS distance request] Failed to stop orphaned location tracking', error),
                    );
                }
                return;
            }

            setShowContinueTripModal(true);
        }

        handleGpsTripInProgressOnAppRestart();
    }, [gpsDraftDetails?.isTracking, gpsDraftDetailsMetadata.status]);

    useEffect(() => {
        return () => {
            hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).then((isRunning) => {
                if (!isRunning) {
                    return;
                }

                stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) => console.error('[GPS distance request] Failed to stop location tracking', error));
            });
        };
    }, []);

    const navigateToGpsScreen = () => {
        Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID));
    };

    const continueGpsTrip = async () => {
        const isBackgroundTaskRunning = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME);

        const unit = gpsDraftDetails?.unit;

        if (isBackgroundTaskRunning) {
            if (unit) {
                startGpsTripNotification(translate, reportID, unit, gpsDraftDetails?.distanceInMeters);
            }
            return;
        }

        try {
            await startLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME, BACKGROUND_LOCATION_TASK_OPTIONS);
        } catch (error) {
            console.error('[GPS distance request] Failed to restart location tracking', error);
            return;
        }

        if (!unit) {
            return;
        }

        startGpsTripNotification(translate, reportID, unit, gpsDraftDetails?.distanceInMeters);
    };

    const onContinueTrip = () => {
        setShowContinueTripModal(false);
        continueGpsTrip();
        navigateToGpsScreen();
    };

    const onViewTrip = () => {
        setShowContinueTripModal(false);
        stopGpsTrip(isOffline, getGpsPoints(gpsDraftDetails));
        navigateToGpsScreen();
    };

    return (
        <ConfirmModal
            isVisible={showContinueTripModal && !!gpsDraftDetails?.isTracking && !isTripFromDifferentUser && splashScreenState === CONST.BOOT_SPLASH_STATE.HIDDEN}
            title={translate('gps.continueGpsTripModal.title')}
            prompt={translate('gps.continueGpsTripModal.prompt')}
            shouldReverseStackedButtons
            confirmText={translate('gps.continueGpsTripModal.confirm')}
            cancelText={translate('gps.continueGpsTripModal.cancel')}
            onCancel={onViewTrip}
            onConfirm={onContinueTrip}
        />
    );
}

GPSTripStateChecker.displayName = 'GPSTripStateChecker';

export default GPSTripStateChecker;
