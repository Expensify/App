import React from 'react';
import FastTrack from '@assets/images/fast-track-cover.jpg';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import FeatureTrainingModal from './FeatureTrainingModal';

function TestDriveModal() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const closeModal = () => {
        Navigation.dismissModal();
    };

    const navigateTestDriveDemo = () => {};

    return (
        <FeatureTrainingModal
            image={FastTrack}
            illustrationOuterContainerStyle={styles.p0}
            illustrationAspectRatio={CONST.FEATURE_TRAINING.TEST_DRIVE_COVER_ASPECT_RATIO}
            title={translate('testDrive.modal.title')}
            description={translate('testDrive.modal.description')}
            helpText={translate('testDrive.modal.helpText')}
            confirmText={translate('testDrive.modal.confirmText')}
            onHelp={closeModal}
            onConfirm={navigateTestDriveDemo}
            shouldRenderSVG={false}
            modalInnerContainerStyle={styles.testDriveModalContainer}
        />
    );
}

TestDriveModal.displayName = 'TestDriveModal';

export default TestDriveModal;
