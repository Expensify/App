import React from 'react';
import FastTrack from '@assets/images/fast-track-cover.jpg';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type BaseTestDriveModalProps = Partial<ChildrenProps> & {
    description: string;
    onHelp: (closeModal: () => void) => void;
    onConfirm: (closeModal: () => void) => void;
    onClose: (() => void) | undefined;
};

function BaseTestDriveModal({description, onHelp, onConfirm, onClose, children}: BaseTestDriveModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FeatureTrainingModal
            image={FastTrack}
            illustrationOuterContainerStyle={styles.p0}
            illustrationAspectRatio={CONST.FEATURE_TRAINING.TEST_DRIVE_COVER_ASPECT_RATIO}
            title={translate('testDrive.modal.title')}
            description={description}
            helpText={translate('testDrive.modal.helpText')}
            confirmText={translate('testDrive.modal.confirmText')}
            onHelp={onHelp}
            onConfirm={onConfirm}
            onClose={onClose}
            shouldRenderSVG={false}
            modalInnerContainerStyle={styles.testDriveModalContainer}
            shouldCloseOnConfirm={false}
        >
            {children}
        </FeatureTrainingModal>
    );
}

BaseTestDriveModal.displayName = 'BaseTestDriveModal';

export default BaseTestDriveModal;
