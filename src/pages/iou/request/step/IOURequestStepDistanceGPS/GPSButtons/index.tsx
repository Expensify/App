import React, {useState} from 'react';
import {Linking, View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addGpsPoints, initGpsDraft, resetGPSDraftDetails, setEndAddress, setIsTracking, setStartAddress} from '@libs/actions/GPSDraftDetails';
import BackgroundLocationPermissionsFlow from '@pages/iou/request/step/IOURequestStepDistanceGPS/BackgroundLocationPermissionsFlow';
import ONYXKEYS from '@src/ONYXKEYS';

type ButtonsProps = {
    navigateToNextStep: () => void;
    setShouldShowStartError: React.Dispatch<React.SetStateAction<boolean>>;
    setShouldShowPermissionsError: React.Dispatch<React.SetStateAction<boolean>>;
};

// next line will be removed in a follow-up PR where the currently unused props will be used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function GPSButtons({navigateToNextStep, setShouldShowStartError, setShouldShowPermissionsError}: ButtonsProps) {
    const [startPermissionsFlow, setStartPermissionsFlow] = useState(false);
    const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
    const [showStopConfirmation, setShowStopConfirmation] = useState(false);
    const [showZeroDistanceModal, setShowZeroDistanceModal] = useState(false);
    const [showLocationRequiredModal, setShowLocationRequiredModal] = useState(false);

    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker'));
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isTripCaptured = !gpsDraftDetails?.isTracking && (gpsDraftDetails?.gpsPoints?.length ?? 0) > 0;

    /**
     * todo: startGpsTrip, onNext, checkPermissions and stopGpsTrip are implemented like this to show
     * all UI components to test as of now, their proper implementation will be added in follow-up PRs
     */
    const startGpsTrip = () => {
        initGpsDraft();

        setIsTracking(true);
        setStartAddress({value: '181 3rd St, San Francisco, CA', type: 'address'});
        addGpsPoints([]);
    };

    const stopGpsTrip = () => {
        setIsTracking(false);

        setTimeout(() => {
            setEndAddress({value: '181 3rd St, San Francisco, CA', type: 'address'});
        }, 500);
    };

    const onNext = () => {
        if (gpsDraftDetails?.distanceInMeters === 0) {
            setShowZeroDistanceModal(true);
        }

        navigateToNextStep();
    };

    const checkPermissions = () => {
        setStartPermissionsFlow(true);
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
                    onPress={gpsDraftDetails?.isTracking ? () => setShowStopConfirmation(true) : checkPermissions}
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
                title={translate('gps.locationRequiredModal.title')}
                isVisible={showLocationRequiredModal}
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
        </>
    );
}

export default GPSButtons;
