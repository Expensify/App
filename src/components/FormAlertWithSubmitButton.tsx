import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {MaybePhraseKey} from '@libs/Localize';
import Button from './Button';
import FormAlertWrapper from './FormAlertWrapper';

type FormAlertWithSubmitButtonProps = {
    /** Error message to display above button */
    message?: MaybePhraseKey;

    /** Whether the button is disabled */
    isDisabled?: boolean;

    /** Whether message is in html format */
    isMessageHtml?: boolean;

    /** Styles for container element */
    containerStyles?: StyleProp<ViewStyle>;

    /** Is the button in a loading state */
    isLoading?: boolean;

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

    /** Text for the button */
    buttonText: string;

    /** Whether to use a smaller submit button size */
    useSmallerSubmitButtonSize?: boolean;

    /** Style for the error message for submit button */
    errorMessageStyle?: StyleProp<ViewStyle>;
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
    buttonStyles,
    buttonText,
    isAlertVisible = false,
    onSubmit,
    useSmallerSubmitButtonSize = false,
    errorMessageStyle,
}: FormAlertWithSubmitButtonProps) {
    const styles = useThemeStyles();
    const style = [!footerContent ? {} : styles.mb3, buttonStyles];

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
                    {isOffline && !enabledWhenOffline ? (
                        <Button
                            success
                            isDisabled
                            text={buttonText}
                            style={style}
                            danger={isSubmitActionDangerous}
                            medium={useSmallerSubmitButtonSize}
                            large={!useSmallerSubmitButtonSize}
                        />
                    ) : (
                        <Button
                            success
                            pressOnEnter={!disablePressOnEnter}
                            text={buttonText}
                            style={style}
                            onPress={onSubmit}
                            isDisabled={isDisabled}
                            isLoading={isLoading}
                            danger={isSubmitActionDangerous}
                            medium={useSmallerSubmitButtonSize}
                            large={!useSmallerSubmitButtonSize}
                        />
                    )}
                    {footerContent}
                </View>
            )}
        </FormAlertWrapper>
    );
}

FormAlertWithSubmitButton.displayName = 'FormAlertWithSubmitButton';

export default FormAlertWithSubmitButton;

export type {FormAlertWithSubmitButtonProps};
