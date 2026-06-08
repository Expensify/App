import {hasServicesEnabledAsync, startLocationUpdatesAsync} from 'expo-location';
import React, {useState} from 'react';
import {Linking, View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {initGpsDraft, resumeGpsTrip as resumeGpsTripUtil} from '@libs/actions/GPSDraftDetails';
import {isTripStopped as isTripStoppedUtil, stopGpsTrip as stopGpsTripUtil} from '@libs/GPSDraftDetailsUtils';
import BackgroundLocationPermissionsFlow from '@pages/iou/request/step/IOURequestStepDistanceGPS/BackgroundLocationPermissionsFlow';
import {BACKGROUND_LOCATION_TASK_OPTIONS, BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import {startGpsTripNotification} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GPSPoint} from '@src/types/onyx/GpsDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';
import GPSTooltip from './GPSTooltip';
import openSettings from './openSettings';

type ButtonsProps = {
    /** Function to call when user clicks next button after ending a trip */
    navigateToNextStep: () => void;

    /** Function to call when there is an error starting GPS tracking */
    setShouldShowStartError: React.Dispatch<React.SetStateAction<boolean>>;

    /** Function to call when there is a permissions error */
    setShouldShowPermissionsError: React.Dispatch<React.SetStateAction<boolean>>;

    /** reportID of the ongoing GPS trip */
    reportID: string;

    /** Distance unit of the ongoing GPS trip */
    unit: Unit;

    /** Captured GPS points */
    gpsPoints: GPSPoint[][];
};

function GPSButtons({navigateToNextStep, setShouldShowStartError, setShouldShowPermissionsError, reportID, unit, gpsPoints}: ButtonsProps) {
    const [startPermissionsFlow, setStartPermissionsFlow] = useState(false);
    const [showLocationRequiredModal, setShowLocationRequiredModal] = useState(false);
    const [showZeroDistanceModal, setShowZeroDistanceModal] = useState(false);
    const [showDisabledServicesModal, setShowDisabledServicesModal] = useState(false);
    const {isOffline} = useNetwork();

    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker'));
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    const checkSettingsAndPermissions = async () => {
        setShouldShowStartError(false);

        const hasLocationServicesEnabled = await hasServicesEnabledAsync();

        if (!hasLocationServicesEnabled) {
            setShowDisabledServicesModal(true);
            return;
        }

        setStartPermissionsFlow(true);
    };

    // Returns true if location tracking was successfully initialized, false otherwise
    const initLocationTracking = async (): Promise<boolean> => {
        try {
            await startLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME, BACKGROUND_LOCATION_TASK_OPTIONS);
        } catch (error) {
            console.error('[GPS distance request] Failed to start location tracking', error);
            setShouldShowStartError(true);
            return false;
        }
        return true;
    };

    const startGpsTrip = async () => {
        const locationTrackingInitSuccessfully = await initLocationTracking();

        if (!locationTrackingInitSuccessfully) {
            return;
        }

        initGpsDraft(reportID, unit);
        startGpsTripNotification(translate, reportID, unit);
    };

    const resumeGpsTrip = async () => {
        const locationTrackingInitSuccessfully = await initLocationTracking();

        if (!locationTrackingInitSuccessfully) {
            return;
        }

        resumeGpsTripUtil(gpsDraftDetails);
        startGpsTripNotification(translate, reportID, unit, gpsDraftDetails?.distanceInMeters);
    };

    const stopGpsTrip = () => {
        stopGpsTripUtil(isOffline, gpsPoints);
    };

    const saveGpsTrip = () => {
        if (gpsDraftDetails?.distanceInMeters === 0) {
            setShowZeroDistanceModal(true);
            return;
        }

        navigateToNextStep();
    };

    const openSettingsForLocationServices = () => {
        setShowDisabledServicesModal(false);
        openSettings();
    };

    return (
        <>
            {isTripStopped ? (
                <View style={[styles.gap2, styles.flexRow]}>
                    <Button
                        onPress={resumeGpsTrip}
                        allowBubble
                        pressOnEnter
                        large
                        style={[styles.flex1]}
                        text={translate('gps.resume')}
                        sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.GPS_DISCARD_BUTTON}
                    />
                    <Button
                        onPress={saveGpsTrip}
                        success
                        allowBubble
                        pressOnEnter
                        large
                        style={[styles.flex1]}
                        text={translate('gps.save')}
                        sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.GPS_NEXT_BUTTON}
                    />
                </View>
            ) : (
                <GPSTooltip>
                    <View>
                        <Button
                            onPress={gpsDraftDetails?.isTracking ? stopGpsTrip : checkSettingsAndPermissions}
                            success={!gpsDraftDetails?.isTracking}
                            allowBubble
                            pressOnEnter
                            large
                            style={[styles.w100, styles.flexShrink0]}
                            text={gpsDraftDetails?.isTracking ? translate('gps.stop') : translate('gps.start')}
                            sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.GPS_START_STOP_BUTTON}
                        />
                    </View>
                </GPSTooltip>
            )}

            <BackgroundLocationPermissionsFlow
                onError={() => setShouldShowPermissionsError(true)}
                startPermissionsFlow={startPermissionsFlow}
                setStartPermissionsFlow={setStartPermissionsFlow}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onGrant={startGpsTrip}
                onDeny={() => setShowLocationRequiredModal(true)}
            />

            <ConfirmModal
                shouldShowCancelButton={false}
                title={translate('gps.zeroDistanceTripModal.title')}
                isVisible={showZeroDistanceModal}
                onConfirm={() => setShowZeroDistanceModal(false)}
                confirmText={translate('common.buttonConfirm')}
                prompt={translate('gps.zeroDistanceTripModal.prompt')}
            />
            <ConfirmModal
                isVisible={showLocationRequiredModal}
                title={translate('gps.locationRequiredModal.title')}
                onConfirm={() => {
                    setShowLocationRequiredModal(false);
                    Linking.openSettings();
                }}
                onCancel={() => setShowLocationRequiredModal(false)}
                confirmText={translate('common.settings')}
                cancelText={translate('common.dismiss')}
                prompt={translate('gps.locationRequiredModal.prompt')}
                iconSource={ReceiptLocationMarker}
                iconFill={false}
                iconWidth={140}
                iconHeight={120}
                shouldCenterIcon
                shouldReverseStackedButtons
            />
            <ConfirmModal
                title={translate('gps.locationServicesRequiredModal.title')}
                isVisible={showDisabledServicesModal}
                onConfirm={openSettingsForLocationServices}
                onCancel={() => setShowDisabledServicesModal(false)}
                confirmText={translate('gps.locationServicesRequiredModal.confirm')}
                cancelText={translate('common.dismiss')}
                prompt={translate('gps.locationServicesRequiredModal.prompt')}
                shouldReverseStackedButtons
            />
        </>
    );
}

export default GPSButtons;
