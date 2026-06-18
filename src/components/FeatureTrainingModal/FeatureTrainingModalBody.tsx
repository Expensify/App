import React from 'react';
import {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import FeatureTrainingModalContent from './FeatureTrainingModalContent';
import FeatureTrainingModalIllustration from './FeatureTrainingModalIllustration';
import type {BaseFeatureTrainingModalProps, FeatureTrainingModalPageProps} from './index';

type FeatureTrainingModalBodyProps = BaseFeatureTrainingModalProps &
    FeatureTrainingModalPageProps & {
        /** Padding for the modal */
        modalPadding: number;

        /** Whether the modal should be shown again */
        willShowAgain: boolean;

        /** A callback to call when the modal should be shown again */
        toggleWillShowAgain: () => void;

        /** A callback to call when we want to close the modal */
        closeModal: (didPressHelpButton?: boolean) => void;

        /** A callback to call when we want to close the modal and confirm */
        confirmModal: () => void;

        /** Whether to show the back button to navigate back to the previous page in carousel mode */
        shouldShowBackButton?: boolean;

        /** A callback to call when we want to navigate back to the previous page in carousel mode */
        onBack?: () => void;
    };

function FeatureTrainingModalBody({
    illustrationInnerContainerStyle,
    illustrationOuterContainerStyle,
    illustrationAspectRatio: illustrationAspectRatioProp,
    width,
    title = '',
    subtitle = '',
    description = '',
    secondaryDescription = '',
    titleStyles,
    shouldShowDismissModalOption = false,
    confirmText = '',
    helpText = '',
    onHelp = () => {},
    children,
    contentInnerContainerStyles,
    contentOuterContainerStyles,
    shouldRenderSVG = true,
    shouldRenderHTMLDescription = false,
    shouldShowConfirmationLoader = false,
    canConfirmWhileOffline = true,
    shouldCallOnHelpWhenModalHidden = false,
    helpSentryLabel,
    confirmSentryLabel,
    modalPadding,
    willShowAgain = true,
    toggleWillShowAgain,
    closeModal,
    confirmModal,
    shouldShowBackButton = false,
    onBack,
    ...props
}: FeatureTrainingModalBodyProps) {
    const StyleUtils = useStyleUtils();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    return (
        <View style={width && onboardingIsMediumOrLargerScreenWidth ? StyleUtils.getWidthStyle(width) : undefined}>
            <FeatureTrainingModalIllustration
                illustrationAspectRatio={illustrationAspectRatioProp}
                illustrationInnerContainerStyle={illustrationInnerContainerStyle}
                illustrationOuterContainerStyle={illustrationOuterContainerStyle}
                shouldRenderSVG={shouldRenderSVG}
                modalPadding={modalPadding}
                {...props}
            />
            <FeatureTrainingModalContent
                title={title}
                subtitle={subtitle}
                description={description}
                secondaryDescription={secondaryDescription}
                confirmText={confirmText}
                helpText={helpText}
                onHelp={onHelp}
                shouldCallOnHelpWhenModalHidden={shouldCallOnHelpWhenModalHidden}
                helpSentryLabel={helpSentryLabel}
                confirmSentryLabel={confirmSentryLabel}
                shouldShowDismissModalOption={shouldShowDismissModalOption}
                willShowAgain={willShowAgain}
                toggleWillShowAgain={toggleWillShowAgain}
                closeModal={closeModal}
                confirmModal={confirmModal}
                shouldShowBackButton={shouldShowBackButton}
                onBack={onBack}
                shouldShowConfirmationLoader={shouldShowConfirmationLoader}
                canConfirmWhileOffline={canConfirmWhileOffline}
                titleStyles={titleStyles}
                contentInnerContainerStyles={contentInnerContainerStyles}
                contentOuterContainerStyles={contentOuterContainerStyles}
                shouldRenderHTMLDescription={shouldRenderHTMLDescription}
            >
                {children}
            </FeatureTrainingModalContent>
        </View>
    );
}

export default FeatureTrainingModalBody;
