import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import OfflineIndicator from '@components/OfflineIndicator';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FeatureTrainingModalContentProps as BaseFeatureTrainingModalContentProps, BaseFeatureTrainingModalProps} from './index';

type FeatureTrainingModalContentProps = Pick<
    BaseFeatureTrainingModalProps,
    | 'helpText'
    | 'onHelp'
    | 'shouldCallOnHelpWhenModalHidden'
    | 'helpSentryLabel'
    | 'confirmSentryLabel'
    | 'shouldShowDismissModalOption'
    | 'shouldShowConfirmationLoader'
    | 'canConfirmWhileOffline'
    | 'titleStyles'
    | 'contentInnerContainerStyles'
    | 'contentOuterContainerStyles'
    | 'shouldRenderHTMLDescription'
    | 'children'
> &
    BaseFeatureTrainingModalContentProps & {
        /** Whether the modal should be shown again (drives the dismiss checkbox state) */
        willShowAgain: boolean;

        /** Callback when the "Don't show me this again" option is toggled */
        toggleWillShowAgain: () => void;

        /** Callback to close the modal */
        closeModal: (didPressHelpButton?: boolean) => void;

        /** Callback when the user presses the confirm button */
        confirmModal: () => void;

        /** Whether to render a Back button (carousel mode, non-first pages) */
        shouldShowBackButton?: boolean;

        /** Callback when the Back button is pressed */
        onBack?: () => void;
    };

function FeatureTrainingModalContent({
    title = '',
    subtitle = '',
    description = '',
    secondaryDescription = '',
    confirmText,
    helpText = '',
    onHelp = () => {},
    shouldCallOnHelpWhenModalHidden = false,
    helpSentryLabel,
    confirmSentryLabel,
    shouldShowDismissModalOption = false,
    willShowAgain,
    toggleWillShowAgain,
    closeModal,
    confirmModal,
    shouldShowBackButton = false,
    onBack,
    shouldShowConfirmationLoader = false,
    canConfirmWhileOffline = true,
    titleStyles,
    contentInnerContainerStyles,
    contentOuterContainerStyles,
    shouldRenderHTMLDescription = false,
    children,
}: FeatureTrainingModalContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    return (
        <View style={[styles.mt5, styles.mh5, contentOuterContainerStyles]}>
            {!!title && !!description && (
                <View style={[onboardingIsMediumOrLargerScreenWidth ? [styles.gap1, styles.mb8] : [shouldRenderHTMLDescription ? styles.mb5 : styles.mb10], contentInnerContainerStyles]}>
                    {!!subtitle && <Text style={[styles.textLabel, styles.textBold, styles.textSuccess]}>{subtitle}</Text>}
                    {typeof title === 'string' ? <Text style={[styles.textHeadlineH1, titleStyles]}>{title}</Text> : title}
                    {shouldRenderHTMLDescription ? (
                        <View style={[styles.flexRow, styles.w100, styles.mb2, styles.renderHTML]}>
                            <RenderHTML html={description} />
                        </View>
                    ) : (
                        <Text style={styles.textSupporting}>{description}</Text>
                    )}
                    {secondaryDescription.length > 0 && <Text style={[styles.textSupporting, styles.mt4]}>{secondaryDescription}</Text>}
                    {children}
                </View>
            )}
            {shouldShowDismissModalOption && (
                <CheckboxWithLabel
                    label={translate('featureTraining.doNotShowAgain')}
                    accessibilityLabel={translate('featureTraining.doNotShowAgain')}
                    style={[styles.mb5]}
                    isChecked={!willShowAgain}
                    onInputChange={toggleWillShowAgain}
                />
            )}
            {!!helpText && (
                <Button
                    large
                    style={[styles.mb3]}
                    onPress={() => {
                        if (shouldCallOnHelpWhenModalHidden) {
                            closeModal(true);
                            return;
                        }
                        onHelp();
                    }}
                    text={helpText}
                    sentryLabel={helpSentryLabel}
                />
            )}
            <View style={styles.featureTrainingModalNavButtons}>
                {shouldShowBackButton && (
                    <Button
                        large
                        onPress={onBack}
                        text={translate('common.back')}
                        sentryLabel={confirmSentryLabel}
                        style={styles.flex1}
                    />
                )}
                <FormAlertWithSubmitButton
                    onSubmit={confirmModal}
                    isLoading={shouldShowConfirmationLoader}
                    buttonText={confirmText}
                    enabledWhenOffline={canConfirmWhileOffline}
                    sentryLabel={confirmSentryLabel}
                    containerStyles={styles.flex1}
                />
            </View>
            {!canConfirmWhileOffline && <OfflineIndicator />}
        </View>
    );
}

export default FeatureTrainingModalContent;
export type {FeatureTrainingModalContentProps};
