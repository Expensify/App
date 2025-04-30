import React, {useCallback} from 'react';
import {InteractionManager} from 'react-native';
import FastTrack from '@assets/images/fast-track-cover.jpg';
import type {FeatureTrainingModalProps} from '@components/FeatureTrainingModal';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

type BaseTestDriveModalProps = Pick<
    FeatureTrainingModalProps,
    'children' | 'description' | 'onConfirm' | 'onClose' | 'shouldCloseOnConfirm' | 'shouldRenderHTMLDescription' | 'contentInnerContainerStyles'
>;

function BaseTestDriveModal({description, onConfirm, onClose, children, shouldCloseOnConfirm, shouldRenderHTMLDescription, contentInnerContainerStyles}: BaseTestDriveModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const skipTestDrive = useCallback(() => {
        InteractionManager.runAfterInteractions(() => {
            Navigation.dismissModal();
        });
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
            onClose={onClose}
            shouldRenderSVG={false}
            modalInnerContainerStyle={styles.testDriveModalContainer}
            contentInnerContainerStyles={contentInnerContainerStyles}
            shouldCloseOnConfirm={shouldCloseOnConfirm}
            shouldRenderHTMLDescription={shouldRenderHTMLDescription}
        >
            {children}
        </FeatureTrainingModal>
    );
}

BaseTestDriveModal.displayName = 'BaseTestDriveModal';

export default BaseTestDriveModal;
