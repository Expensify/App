import Button from '@components/Button';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSession} from '@components/OnyxListItemProvider';

import useConfirmModal from '@hooks/useConfirmModal';
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

import {hasServicesEnabledAsync, startLocationUpdatesAsync} from 'expo-location';
import React, {useState} from 'react';
import {Linking, View} from 'react-native';

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
    const {isOffline} = useNetwork();
    const session = useSession();
    const {showConfirmModal} = useConfirmModal();

    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker'));
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    const showDisabledServicesModal = () => {
        showConfirmModal({
            title: translate('gps.locationServicesRequiredModal.title'),
            prompt: translate('gps.locationServicesRequiredModal.prompt'),
            confirmText: translate('gps.locationServicesRequiredModal.confirm'),
            cancelText: translate('common.dismiss'),
            shouldReverseStackedButtons: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            openSettings();
        });
    };

    const showLocationRequiredModal = () => {
        showConfirmModal({
            title: translate('gps.locationRequiredModal.title'),
            prompt: translate('gps.locationRequiredModal.prompt'),
            confirmText: translate('common.settings'),
            cancelText: translate('common.dismiss'),
            iconSource: ReceiptLocationMarker,
            iconFill: false,
            iconWidth: 140,
            iconHeight: 120,
            shouldCenterIcon: true,
            shouldReverseStackedButtons: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            Linking.openSettings();
        });
    };

    const showZeroDistanceModal = () => {
        showConfirmModal({
            title: translate('gps.zeroDistanceTripModal.title'),
            prompt: translate('gps.zeroDistanceTripModal.prompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const checkSettingsAndPermissions = async () => {
        setShouldShowStartError(false);

        const hasLocationServicesEnabled = await hasServicesEnabledAsync();

        if (!hasLocationServicesEnabled) {
            showDisabledServicesModal();
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

        initGpsDraft(reportID, unit, session?.accountID);
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
            showZeroDistanceModal();
            return;
        }

        navigateToNextStep();
    };

    return (
        <>
            {isTripStopped ? (
                <View style={[styles.gap2, styles.flexRow]}>
                    <Button
                        onPress={checkSettingsAndPermissions}
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={[styles.flex1]}
                        sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.GPS_DISCARD_BUTTON}
                    >
                        <Button.KeyboardShortcut allowBubble />
                        <Button.Text>{translate('gps.resume')}</Button.Text>
                    </Button>
                    <Button
                        onPress={saveGpsTrip}
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={[styles.flex1]}
                        sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.GPS_NEXT_BUTTON}
                    >
                        <Button.KeyboardShortcut allowBubble />
                        <Button.Text>{translate('gps.save')}</Button.Text>
                    </Button>
                </View>
            ) : (
                <GPSTooltip>
                    <View>
                        <Button
                            onPress={gpsDraftDetails?.isTracking ? stopGpsTrip : checkSettingsAndPermissions}
                            variant={gpsDraftDetails?.isTracking ? undefined : CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                            style={[styles.w100, styles.flexShrink0]}
                            sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.GPS_START_STOP_BUTTON}
                        >
                            <Button.KeyboardShortcut allowBubble />
                            <Button.Text>{gpsDraftDetails?.isTracking ? translate('gps.stop') : translate('gps.start')}</Button.Text>
                        </Button>
                    </View>
                </GPSTooltip>
            )}

            <BackgroundLocationPermissionsFlow
                onError={() => setShouldShowPermissionsError(true)}
                startPermissionsFlow={startPermissionsFlow}
                setStartPermissionsFlow={setStartPermissionsFlow}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onGrant={isTripStopped ? resumeGpsTrip : startGpsTrip}
                onDeny={showLocationRequiredModal}
            />
        </>
    );
}

export default GPSButtons;
