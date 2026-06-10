import type {Ref} from 'react';
import React, {useCallback} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import usePressLoading from '@hooks/usePressLoading';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import Button from './Button';
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

    /** Shows the spinner the moment the button is pressed, ahead of `onSubmit` and any consumer-driven `isLoading`. */
    shouldShowLoadingImmediatelyOnPress?: boolean;

    /** Callback fired when the "fix the errors" link is pressed */
    onFixTheErrorsLinkPressed?: () => void;

    /** Submit function */
    onSubmit: () => void;

    /** Should the button be enabled when offline */
    enabledWhenOffline?: boolean;

    /** Disable press on enter for submit button */
    disablePressOnEnter?: boolean;

    /** Whether the form submit action is dangerous */
    isSubmitActionDangerous?: boolean;

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

    /** Whether to use a smaller submit button size */
    useSmallerSubmitButtonSize?: boolean;

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
    shouldBlendOpacity?: boolean;

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
    isLoading = false,
    onFixTheErrorsLinkPressed = () => {},
    enabledWhenOffline = false,
    disablePressOnEnter = false,
    isSubmitActionDangerous = false,
    footerContent,
    buttonRef,
    buttonStyles,
    buttonText,
    isAlertVisible = false,
    onSubmit,
    useSmallerSubmitButtonSize = false,
    errorMessageStyle,
    enterKeyEventListenerPriority = 0,
    shouldRenderFooterAboveSubmit = false,
    shouldBlendOpacity = false,
    addButtonBottomPadding = true,
    shouldPreventDefaultFocusOnPress = false,
    shouldShowLoadingImmediatelyOnPress = true,
    sentryLabel,
}: FormAlertWithSubmitButtonProps) {
    const styles = useThemeStyles();
    const style = [!shouldRenderFooterAboveSubmit && footerContent && addButtonBottomPadding ? styles.mb3 : {}, buttonStyles];

    const {isPressed, startPressLoading} = usePressLoading();

    const handlePress = useCallback(() => {
        if (!shouldShowLoadingImmediatelyOnPress) {
            onSubmit();
            return;
        }
        startPressLoading(onSubmit);
    }, [onSubmit, shouldShowLoadingImmediatelyOnPress, startPressLoading]);

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
                            success
                            shouldBlendOpacity={shouldBlendOpacity}
                            isDisabled
                            text={buttonText}
                            style={style}
                            danger={isSubmitActionDangerous}
                            medium={useSmallerSubmitButtonSize}
                            large={!useSmallerSubmitButtonSize}
                            onMouseDown={shouldPreventDefaultFocusOnPress ? (e) => e.preventDefault() : undefined}
                            sentryLabel={sentryLabel}
                        />
                    ) : (
                        <Button
                            ref={buttonRef}
                            success
                            shouldBlendOpacity={shouldBlendOpacity}
                            pressOnEnter={pressOnEnter}
                            enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                            text={buttonText}
                            style={style}
                            onPress={handlePress}
                            isDisabled={isDisabled}
                            isLoading={isPressed || isLoading}
                            danger={isSubmitActionDangerous}
                            medium={useSmallerSubmitButtonSize}
                            large={!useSmallerSubmitButtonSize}
                            onMouseDown={shouldPreventDefaultFocusOnPress ? (e) => e.preventDefault() : undefined}
                            sentryLabel={sentryLabel}
                        />
                    )}
                    {!shouldRenderFooterAboveSubmit && footerContent}
                </View>
            )}
        </FormAlertWrapper>
    );
}

export default FormAlertWithSubmitButton;

export type {FormAlertWithSubmitButtonProps};
