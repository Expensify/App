import Button from '@components/ButtonComposed';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {FeatureTrainingContentBodyProps as BaseFeatureTrainingContentBodyProps, BaseFeatureTrainingContentProps} from './types';

import FeatureTrainingContentBodyText from './FeatureTrainingContentBodyText';

type FeatureTrainingModalContentProps = Pick<
    BaseFeatureTrainingContentProps,
    | 'helpText'
    | 'onConfirm'
    | 'onHelp'
    | 'helpSentryLabel'
    | 'confirmSentryLabel'
    | 'shouldShowDismissModalOption'
    | 'titleStyles'
    | 'contentInnerContainerStyles'
    | 'contentOuterContainerStyles'
    | 'shouldRenderHTMLDescription'
    | 'children'
> &
    BaseFeatureTrainingContentBodyProps & {
        /** Whether the modal should be shown again (drives the dismiss checkbox state) */
        willShowAgain?: boolean;

        /** Callback when the "Don't show me this again" option is toggled */
        toggleWillShowAgain?: () => void;

        /** Whether to render a Back button (carousel mode, non-first pages) */
        shouldShowBackButton?: boolean;

        /** Callback when the Back button is pressed */
        onBack?: () => void;
    };

function FeatureTrainingContentBody({
    title = '',
    subtitle = '',
    description = '',
    confirmText,
    onConfirm,
    helpText = '',
    onHelp,
    helpSentryLabel,
    confirmSentryLabel,
    shouldShowDismissModalOption = false,
    willShowAgain = false,
    toggleWillShowAgain,
    shouldShowBackButton = false,
    onBack,
    titleStyles,
    contentInnerContainerStyles,
    contentOuterContainerStyles,
    shouldRenderHTMLDescription = false,
    children,
}: FeatureTrainingModalContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.mt5, styles.mh5, contentOuterContainerStyles]}>
            <FeatureTrainingContentBodyText
                title={title}
                subtitle={subtitle}
                description={description}
                titleStyles={titleStyles}
                contentInnerContainerStyles={contentInnerContainerStyles}
                shouldRenderHTMLDescription={shouldRenderHTMLDescription}
            >
                {children}
            </FeatureTrainingContentBodyText>
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
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.mb3]}
                    onPress={onHelp}
                    sentryLabel={helpSentryLabel}
                >
                    <Button.Text>{helpText}</Button.Text>
                </Button>
            )}
            <View style={styles.featureTrainingModalNavButtons}>
                {shouldShowBackButton && (
                    <Button
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={onBack}
                        sentryLabel={CONST.SENTRY_LABEL.FEATURE_TRAINING.BACK_BUTTON}
                        style={styles.flex1}
                    >
                        <Button.Text>{translate('common.back')}</Button.Text>
                    </Button>
                )}
                <FormAlertWithSubmitButton
                    onSubmit={() => onConfirm?.(willShowAgain)}
                    buttonText={confirmText}
                    enabledWhenOffline
                    sentryLabel={confirmSentryLabel}
                    containerStyles={styles.flex1}
                />
            </View>
        </View>
    );
}

export default FeatureTrainingContentBody;
