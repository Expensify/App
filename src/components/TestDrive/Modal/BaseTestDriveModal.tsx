import React, {useCallback} from 'react';
import FastTrack from '@assets/images/fast-track-cover.png';
import type {FeatureTrainingModalProps} from '@components/FeatureTrainingModal';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

type BaseTestDriveModalProps = Pick<
    FeatureTrainingModalProps,
    'children' | 'description' | 'onConfirm' | 'shouldCloseOnConfirm' | 'shouldRenderHTMLDescription' | 'avoidKeyboard' | 'shouldShowConfirmationLoader' | 'canConfirmWhileOffline'
>;

function BaseTestDriveModal({
    description,
    onConfirm,
    children,
    shouldCloseOnConfirm,
    shouldRenderHTMLDescription,
    avoidKeyboard,
    shouldShowConfirmationLoader,
    canConfirmWhileOffline,
}: BaseTestDriveModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const skipTestDrive = useCallback(() => {
        Navigation.dismissModal();
    }, []);

    return (
        <FeatureTrainingModal
            image={FastTrack}
            illustrationOuterContainerStyle={styles.p0}
            illustrationAspectRatio={CONST.FEATURE_TRAINING.TEST_DRIVE_COVER_ASPECT_RATIO}
            title={translate('testDrive.modal.title')}
            description={description}
            helpText={translate('testDrive.modal.helpText')}
            confirmText={translate('testDrive.modal.confirmText')}
            onHelp={skipTestDrive}
            onConfirm={onConfirm}
            shouldRenderSVG={false}
            modalInnerContainerStyle={styles.testDriveModalContainer(shouldUseNarrowLayout)}
            contentInnerContainerStyles={styles.gap2}
            shouldCloseOnConfirm={shouldCloseOnConfirm}
            shouldRenderHTMLDescription={shouldRenderHTMLDescription}
            avoidKeyboard={avoidKeyboard}
            shouldShowConfirmationLoader={shouldShowConfirmationLoader}
            shouldUseScrollView
            canConfirmWhileOffline={canConfirmWhileOffline}
        >
            {children}
        </FeatureTrainingModal>
    );
}

BaseTestDriveModal.displayName = 'BaseTestDriveModal';

export default BaseTestDriveModal;
