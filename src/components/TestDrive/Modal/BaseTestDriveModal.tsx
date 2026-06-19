import React from 'react';
import TestDrive from '@assets/images/test-drive.svg';
import CenteredModalLayout from '@components/CenteredModalLayout';
import type {FeatureTrainingContentProps} from '@components/FeatureTrainingContent';
import FeatureTrainingContent from '@components/FeatureTrainingContent';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setOnboardingTestDriveModalDismissed} from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

type BaseTestDriveModalProps = Pick<
    FeatureTrainingContentProps,
    'children' | 'description' | 'onConfirm' | 'shouldCloseOnConfirm' | 'shouldRenderHTMLDescription' | 'shouldShowConfirmationLoader' | 'canConfirmWhileOffline' | 'onHelp'
>;

function BaseTestDriveModal({
    description,
    onConfirm,
    onHelp,
    children,
    shouldCloseOnConfirm,
    shouldRenderHTMLDescription,
    shouldShowConfirmationLoader,
    canConfirmWhileOffline,
}: BaseTestDriveModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useBeforeRemove(() => {
        // // On Android, when the app is closed, this callback still gets executed, and `currentRoute` is set to an empty string (`''`).
        // const currentRoute = Navigation.getActiveRoute();
        // if (!currentRoute) {
        //     return;
        // }
        setOnboardingTestDriveModalDismissed();
    });

    const handleClose = () => Navigation.goBack();

    return (
        <CenteredModalLayout
            onBackdropPress={handleClose}
            contentStyle={[styles.pt0, styles.pb0]}
        >
            <FeatureTrainingContent
                image={TestDrive}
                illustrationOuterContainerStyle={styles.p0}
                illustrationAspectRatio={CONST.FEATURE_TRAINING.TEST_DRIVE_COVER_ASPECT_RATIO}
                title={translate('testDrive.modal.title')}
                description={description}
                helpText={translate('testDrive.modal.helpText')}
                confirmText={translate('testDrive.modal.confirmText')}
                onHelp={onHelp}
                onConfirm={onConfirm}
                onClose={handleClose}
                contentInnerContainerStyles={styles.gap2}
                shouldCloseOnConfirm={shouldCloseOnConfirm}
                shouldRenderHTMLDescription={shouldRenderHTMLDescription}
                shouldShowConfirmationLoader={shouldShowConfirmationLoader}
                shouldUseScrollView
                canConfirmWhileOffline={canConfirmWhileOffline}
                helpSentryLabel={CONST.SENTRY_LABEL.TEST_DRIVE_MODAL.SKIP}
                confirmSentryLabel={CONST.SENTRY_LABEL.TEST_DRIVE_MODAL.START}
            >
                {children}
            </FeatureTrainingContent>
        </CenteredModalLayout>
    );
}

export default BaseTestDriveModal;
