import React from 'react';
import TestDrive from '@assets/images/test-drive.svg';
import type {FeatureTrainingModalProps} from '@components/FeatureTrainingModal';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type BaseTestDriveModalProps = Pick<
    FeatureTrainingModalProps,
    'children' | 'description' | 'onConfirm' | 'shouldCloseOnConfirm' | 'shouldRenderHTMLDescription' | 'avoidKeyboard' | 'shouldShowConfirmationLoader' | 'canConfirmWhileOffline' | 'onHelp'
>;

function BaseTestDriveModal({
    description,
    onConfirm,
    onHelp,
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

    return (
        <FeatureTrainingModal
            image={TestDrive}
            illustrationOuterContainerStyle={styles.p0}
            illustrationAspectRatio={CONST.FEATURE_TRAINING.TEST_DRIVE_COVER_ASPECT_RATIO}
            title={translate('testDrive.modal.title')}
            description={description}
            helpText={translate('testDrive.modal.helpText')}
            confirmText={translate('testDrive.modal.confirmText')}
            onHelp={onHelp}
            onConfirm={onConfirm}
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
