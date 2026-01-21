import {hasServicesEnabledAsync, startLocationUpdatesAsync, stopLocationUpdatesAsync} from 'expo-location';
import React, {useState} from 'react';
import {Linking, View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {initGpsDraft, resetGPSDraftDetails, setEndAddress, setIsTracking} from '@libs/actions/GPSDraftDetails';
import {addressFromGpsPoint, coordinatesToString} from '@libs/GPSDraftDetailsUtils';
import BackgroundLocationPermissionsFlow from '@pages/iou/request/step/IOURequestStepDistanceGPS/BackgroundLocationPermissionsFlow';
import {BACKGROUND_LOCATION_TRACKING_TASK_NAME, getBackgroundLocationTaskOptions} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import ONYXKEYS from '@src/ONYXKEYS';
import openSettings from './openSettings';

type ButtonsProps = {
    navigateToNextStep: () => void;
    setShouldShowStartError: React.Dispatch<React.SetStateAction<boolean>>;
    setShouldShowPermissionsError: React.Dispatch<React.SetStateAction<boolean>>;
    reportID: string;
};

function GPSButtons({navigateToNextStep, setShouldShowStartError, setShouldShowPermissionsError, reportID}: ButtonsProps) {
    const [startPermissionsFlow, setStartPermissionsFlow] = useState(false);
    const [showLocationRequiredModal, setShowLocationRequiredModal] = useState(false);
    const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
    const [showStopConfirmation, setShowStopConfirmation] = useState(false);
    const [showZeroDistanceModal, setShowZeroDistanceModal] = useState(false);
    const [showDisabledServicesModal, setShowDisabledServicesModal] = useState(false);

    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker'));
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isTripCaptured = !gpsDraftDetails?.isTracking && (gpsDraftDetails?.gpsPoints?.length ?? 0) > 0;

    const checkSettingsAndPermissions = async () => {
        setShouldShowStartError(false);

        const hasLocationServicesEnabled = await hasServicesEnabledAsync();

        if (!hasLocationServicesEnabled) {
            setShowDisabledServicesModal(true);
            return;
        }

        setStartPermissionsFlow(true);
    };

    const stopGpsTrip = async () => {
        await stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) => console.error('[GPS distance request] Failed to stop location tracking', error));

        setIsTracking(false);

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

    const startGpsTrip = async () => {
        try {
            await startLocationUpdatesAsync(
                BACKGROUND_LOCATION_TRACKING_TASK_NAME,
                getBackgroundLocationTaskOptions(translate('gps.notification.title'), translate('gps.notification.body')),
            );
        } catch (error) {
            console.error('[GPS distance request] Failed to start location tracking', error);
            setShouldShowStartError(true);
            return;
        }

        initGpsDraft(reportID);
    };

    const onNext = () => {
        if (gpsDraftDetails?.distanceInMeters === 0) {
            setShowZeroDistanceModal(true);
        }

        navigateToNextStep();
    };

    const openSettingsForLocationServices = () => {
        setShowDisabledServicesModal(false);
        openSettings();
    };

    return (
        <>
            {isTripCaptured ? (
                <View style={[styles.p5, styles.pt0, styles.gap3]}>
                    <Button
                        onPress={() => setShowDiscardConfirmation(true)}
                        allowBubble
                        pressOnEnter
                        large
                        style={[styles.w100, styles.flexShrink0]}
                        text={translate('gps.discard')}
                    />
                    <Button
                        onPress={onNext}
                        success
                        allowBubble
                        pressOnEnter
                        large
                        style={[styles.w100, styles.flexShrink0]}
                        text={translate('common.next')}
                    />
                </View>
            ) : (
                <Button
                    onPress={gpsDraftDetails?.isTracking ? () => setShowStopConfirmation(true) : checkSettingsAndPermissions}
                    success={!gpsDraftDetails?.isTracking}
                    danger={gpsDraftDetails?.isTracking}
                    allowBubble
                    pressOnEnter
                    large
                    style={[styles.w100, styles.mb5, styles.ph5, styles.flexShrink0]}
                    text={gpsDraftDetails?.isTracking ? translate('gps.stop') : translate('gps.start')}
                />
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
                danger
                title={translate('gps.stopGpsTrackingModal.title')}
                isVisible={showStopConfirmation}
                onConfirm={() => {
                    setShowStopConfirmation(false);
                    stopGpsTrip();
                }}
                onCancel={() => setShowStopConfirmation(false)}
                confirmText={translate('gps.stopGpsTrackingModal.confirm')}
                cancelText={translate('gps.stopGpsTrackingModal.cancel')}
                prompt={translate('gps.stopGpsTrackingModal.prompt')}
            />
            <ConfirmModal
                danger
                title={translate('gps.discardDistanceTrackingModal.title')}
                isVisible={showDiscardConfirmation}
                onConfirm={() => {
                    setShowDiscardConfirmation(false);
                    resetGPSDraftDetails();
                }}
                onCancel={() => setShowDiscardConfirmation(false)}
                confirmText={translate('gps.discardDistanceTrackingModal.confirm')}
                cancelText={translate('common.cancel')}
                prompt={translate('gps.discardDistanceTrackingModal.prompt')}
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
