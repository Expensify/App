import {hasStartedLocationUpdatesAsync, startLocationUpdatesAsync, stopLocationUpdatesAsync} from 'expo-location';
import React, {useEffect, useState} from 'react';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {stopGpsTrip} from '@libs/GPSDraftDetailsUtils';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import {BACKGROUND_LOCATION_TASK_OPTIONS, BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import {checkAndCleanGpsNotification, startGpsTripNotification} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {useSplashScreenState} from '@src/SplashScreenStateContext';
import useUpdateGpsTripOnReconnect from './useUpdateGpsTripOnReconnect';

function GPSTripStateChecker() {
    const {translate} = useLocalize();
    const [showContinueTripModal, setShowContinueTripModal] = useState(false);
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const {isOffline} = useNetwork();

    const {splashScreenState} = useSplashScreenState();

    const reportID = gpsDraftDetails?.reportID ?? generateReportID();

    useUpdateGpsTripOnReconnect();

    useEffect(() => {
        async function handleGpsTripInProgressOnAppRestart() {
            await checkAndCleanGpsNotification();
            const gpsTrip = await OnyxUtils.get(ONYXKEYS.GPS_DRAFT_DETAILS);

            if (!gpsTrip?.isTracking) {
                return;
            }

            setShowContinueTripModal(true);
        }

        handleGpsTripInProgressOnAppRestart();
        checkAndCleanGpsNotification();

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
        stopGpsTrip(isOffline);
        navigateToGpsScreen();
    };

    return (
        <ConfirmModal
            isVisible={showContinueTripModal && splashScreenState === CONST.BOOT_SPLASH_STATE.HIDDEN}
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
