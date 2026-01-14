import {hasStartedLocationUpdatesAsync, startLocationUpdatesAsync, stopLocationUpdatesAsync} from 'expo-location';
import React, {useEffect, useState} from 'react';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {setEndAddress, setIsTracking} from '@libs/actions/GPSDraftDetails';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import {BACKGROUND_LOCATION_TRACKING_TASK_NAME, getBackgroundLocationTaskOptions} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import addressFromGpsPoint from '@pages/iou/request/step/IOURequestStepDistanceGPS/utils/addressFromGpsPoint';
import coordinatesToString from '@pages/iou/request/step/IOURequestStepDistanceGPS/utils/coordinatesToString';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import useUpdateGpsTripOnReconnect from './useUpdateGpsTripOnReconnect';

function GPSTripStateChecker() {
    const {translate} = useLocalize();
    const [showContinueTripModal, setShowContinueTripModal] = useState(false);

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});

    useUpdateGpsTripOnReconnect();

    useEffect(() => {
        async function handleGpsTripInProgressOnAppRestart() {
            const gpsTrip = await OnyxUtils.get(ONYXKEYS.GPS_DRAFT_DETAILS);

            if (!gpsTrip?.isTracking) {
                return;
            }

            setShowContinueTripModal(true);
        }

        handleGpsTripInProgressOnAppRestart();
    }, []);

    const navigateToGpsScreen = () => {
        const optimisticReportID = generateReportID();
        Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
    };

    const continueGpsTrip = async () => {
        const isBackgroundTaskRunning = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME);

        if (isBackgroundTaskRunning) {
            return;
        }

        const notificationTitle = translate('gps.notification.title');
        const notificationBody = translate('gps.notification.body');

        await startLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME, getBackgroundLocationTaskOptions(notificationTitle, notificationBody)).catch((error) =>
            console.error('[GPS distance request] Failed to restart location tracking', error),
        );
    };

    const stopGpsTrip = async () => {
        setIsTracking(false);

        const isBackgroundTaskRunning = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME);

        if (isBackgroundTaskRunning) {
            stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) => console.error('[GPS distance request] Failed to stop location tracking', error));
        }

        const lastPoint = gpsDraftDetails?.gpsPoints?.at(-1);

        if (!lastPoint) {
            return;
        }

        const endAddress = await addressFromGpsPoint(lastPoint);

        if (endAddress === null) {
            const formattedCoordinates = coordinatesToString(lastPoint);
            setEndAddress({value: formattedCoordinates, type: 'coordinates'});
            return;
        }

        setEndAddress({value: endAddress, type: 'address'});
    };

    const onContinueTrip = () => {
        setShowContinueTripModal(false);
        continueGpsTrip();
        navigateToGpsScreen();
    };

    const onViewTrip = () => {
        setShowContinueTripModal(false);
        stopGpsTrip();
        navigateToGpsScreen();
    };

    return (
        <ConfirmModal
            isVisible={showContinueTripModal}
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
