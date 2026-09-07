import usePressLoading from '@hooks/usePressLoading';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';

import type {ButtonVariant} from '@styles/utils/types';

import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {Ref} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import Button from './ButtonComposed';
import FormAlertWrapper from './FormAlertWrapper';

type FormAlertWithSubmitButtonProps = WithSentryLabel & {
    /** Error message to display above button */
    message?: string;

    /** Whether the button is disabled */
    isDisabled?: boolean;

    /** Whether message is in html format */
    isMessageHtml?: boolean;

    /** Styles for container element */
    containerStyles?: StyleProp<ViewStyle>;

    /** Is the button in a loading state */
    isLoading?: boolean;

    /**
     * Controls the submit button's optimistic loading state on press.
     *
     * Shows the spinner the moment the button is pressed, ahead of `onSubmit` and any consumer-driven `isLoading`. Defaults to true.
     * Set it to false when the consumer drives the press loading itself, for example through `usePressLoading`, or when `onSubmit` only changes local state.
     */
    shouldShowLoadingImmediatelyOnPress?: boolean;

    /** Callback fired when the "fix the errors" link is pressed */
    onFixTheErrorsLinkPressed?: () => void;

    /** Submit function */
    onSubmit: () => void;

    /** Should the button be enabled when offline */
    enabledWhenOffline?: boolean;

    /** Disable press on enter for submit button */
    disablePressOnEnter?: boolean;

    /** The visual variant of the submit button, which controls its color scheme */
    buttonVariant?: ButtonVariant;

    /** Custom content to display in the footer after submit button */
    footerContent?: React.ReactNode;

    /** Styles for the button */
    buttonStyles?: StyleProp<ViewStyle>;

    /** Whether to show the alert text */
    isAlertVisible?: boolean;

    /** React ref being forwarded to the submit button */
    buttonRef?: Ref<View>;

    /** Text for the button */
    buttonText: string;

    /** Style for the error message for submit button */
    errorMessageStyle?: StyleProp<ViewStyle>;

    /** The priority to assign the enter key event listener to buttons. 0 is the highest priority. */
    enterKeyEventListenerPriority?: number;

    /** should render the extra button above submit button */
    shouldRenderFooterAboveSubmit?: boolean;

    /**
     * Whether the button should have a background layer in the color of theme.appBG.
     * This is needed for buttons that allow content to display under them.
     */
    blendButtonOpacity?: boolean;

    /** Whether to add a bottom padding to the button */
    addButtonBottomPadding?: boolean;

    /** Prevents the button from triggering blur on mouse down. */
    shouldPreventDefaultFocusOnPress?: boolean;
};

function FormAlertWithSubmitButton({
    message = '',
    isDisabled = false,
    isMessageHtml = false,
    containerStyles,
    isLoading: isOnyxLoading = false,
    onFixTheErrorsLinkPressed = () => {},
    enabledWhenOffline = false,
    disablePressOnEnter = false,
    buttonVariant = CONST.BUTTON_VARIANT.SUCCESS,
    footerContent,
    buttonRef,
    buttonStyles,
    buttonText,
    isAlertVisible = false,
    onSubmit,
    errorMessageStyle,
    enterKeyEventListenerPriority = 0,
    shouldRenderFooterAboveSubmit = false,
    blendButtonOpacity = false,
    addButtonBottomPadding = true,
    shouldPreventDefaultFocusOnPress = false,
    shouldShowLoadingImmediatelyOnPress = true,
    sentryLabel,
}: FormAlertWithSubmitButtonProps) {
    const styles = useThemeStyles();
    const style = [!shouldRenderFooterAboveSubmit && footerContent && addButtonBottomPadding ? styles.mb3 : {}, buttonStyles];

    const {isLoading, startWithLoading} = usePressLoading({isLoading: isOnyxLoading});

    const submit = () => {
        if (!shouldShowLoadingImmediatelyOnPress) {
            onSubmit();
            return;
        }
        startWithLoading(onSubmit);
    };

    // Disable pressOnEnter for Android Native to avoid issues with the Samsung keyboard,
    // where pressing Enter saves the form instead of adding a new line in multiline input.
    // More details: https://github.com/Expensify/App/issues/46644
    const isAndroidNative = getPlatform() === CONST.PLATFORM.ANDROID;
    const pressOnEnter = isAndroidNative ? false : !disablePressOnEnter;

    return (
        <FormAlertWrapper
            containerStyles={[styles.justifyContentEnd, containerStyles]}
            isAlertVisible={isAlertVisible}
            isMessageHtml={isMessageHtml}
            message={message}
            onFixTheErrorsLinkPressed={onFixTheErrorsLinkPressed}
            errorMessageStyle={errorMessageStyle}
        >
            {(isOffline: boolean | undefined) => (
                <View>
                    {shouldRenderFooterAboveSubmit && footerContent}
                    {isOffline && !enabledWhenOffline ? (
                        <Button
                            variant={buttonVariant}
                            blendOpacity={blendButtonOpacity}
                            isDisabled
                            size={CONST.BUTTON_SIZE.LARGE}
                            style={style}
                            onMouseDown={shouldPreventDefaultFocusOnPress ? (e) => e.preventDefault() : undefined}
                            sentryLabel={sentryLabel}
                        >
                            <Button.Text>{buttonText}</Button.Text>
                        </Button>
                    ) : (
                        <Button
                            ref={buttonRef}
                            variant={buttonVariant}
                            blendOpacity={blendButtonOpacity}
                            size={CONST.BUTTON_SIZE.LARGE}
                            style={style}
                            onPress={submit}
                            isDisabled={isDisabled}
                            isLoading={isLoading}
                            onMouseDown={shouldPreventDefaultFocusOnPress ? (e) => e.preventDefault() : undefined}
                            sentryLabel={sentryLabel}
                        >
                            {pressOnEnter && <Button.KeyboardShortcut enterKeyEventListenerPriority={enterKeyEventListenerPriority} />}
                            <Button.Text>{buttonText}</Button.Text>
                        </Button>
                    )}
                    {!shouldRenderFooterAboveSubmit && footerContent}
                </View>
            )}
        </FormAlertWrapper>
    );
}

export default FormAlertWithSubmitButton;

export type {FormAlertWithSubmitButtonProps};
