import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getBrowser} from '@libs/Browser';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import PDFInfoMessage from './PDFInfoMessage';

type PDFPasswordFormProps = {
    /** If the submitted password is invalid (show an error message) */
    isPasswordInvalid?: boolean;

    /** If loading indicator should be shown */
    shouldShowLoadingIndicator?: boolean;

    /** Notify parent that the password form has been submitted */
    onSubmit?: (password: string) => void;

    /** Notify parent that the password has been updated/edited */
    onPasswordUpdated?: (newPassword: string) => void;

    /** Notify parent that a text field has been focused or blurred */
    onPasswordFieldFocused?: (isFocused: boolean) => void;

    /** Should focus to the password input  */
    isFocused: boolean;
};

function PDFPasswordForm({isFocused, isPasswordInvalid = false, shouldShowLoadingIndicator = false, onSubmit, onPasswordUpdated, onPasswordFieldFocused}: PDFPasswordFormProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();

    const [password, setPassword] = useState('');
    const [validationErrorText, setValidationErrorText] = useState<TranslationPaths | null | ''>('');
    const [shouldShowForm, setShouldShowForm] = useState(false);
    const textInputRef = useRef<BaseTextInputRef>(null);

    const focusTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const errorText = useMemo(() => {
        if (isPasswordInvalid) {
            return translate('attachmentView.passwordIncorrect');
        }
        if (validationErrorText) {
            return translate(validationErrorText);
        }
        return '';
    }, [isPasswordInvalid, validationErrorText, translate]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        if (!textInputRef.current) {
            return;
        }
        /**
         * We recommend using setTimeout to wait for the animation to finish and then focus on the input
         * Relevant thread: https://expensify.slack.com/archives/C01GTK53T8Q/p1694660990479979
         */
        focusTimeoutRef.current = setTimeout(() => {
            textInputRef.current?.focus();
        }, CONST.ANIMATED_TRANSITION);
        return () => {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    }, [isFocused]);

    const updatePassword = (newPassword: string) => {
        onPasswordUpdated?.(newPassword);
        if (newPassword && validationErrorText) {
            setValidationErrorText('');
        }
        setPassword(newPassword);
    };

    const validate = () => {
        if (!isPasswordInvalid && password) {
            return true;
        }
        if (!password) {
            setValidationErrorText('attachmentView.passwordRequired');
        }
        return false;
    };

    const submitPassword = () => {
        if (!validate()) {
            return;
        }
        onSubmit?.(password);
    };

    return shouldShowForm ? (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.getPDFPasswordFormStyle(shouldUseNarrowLayout)}
            contentContainerStyle={styles.p5}
        >
            <View style={styles.mb4}>
                <Text>{translate('attachmentView.pdfPasswordForm.formLabel')}</Text>
            </View>
            <TextInput
                ref={textInputRef}
                label={translate('common.password')}
                accessibilityLabel={translate('common.password')}
                role={CONST.ROLE.PRESENTATION}
                /**
                 * This is a workaround to bypass Safari's autofill odd behaviour.
                 * This tricks the browser not to fill the username somewhere else and still fill the password correctly.
                 */
                autoComplete={getBrowser() === CONST.BROWSER.SAFARI ? 'username' : 'off'}
                autoCorrect={false}
                textContentType="password"
                onChangeText={updatePassword}
                enterKeyHint="done"
                onSubmitEditing={submitPassword}
                errorText={errorText}
                onFocus={() => onPasswordFieldFocused?.(true)}
                onBlur={() => onPasswordFieldFocused?.(false)}
                autoFocus
                secureTextEntry
            />
            <Button
                // Keep focus on the TextInput effectively keeping keyboard open
                onMouseDown={(e) => e.preventDefault()}
                text={translate('common.confirm')}
                onPress={submitPassword}
                style={styles.mt4}
                isLoading={shouldShowLoadingIndicator}
                pressOnEnter
                large
            />
        </ScrollView>
    ) : (
        <View style={[styles.flex1, styles.justifyContentCenter]}>
            <PDFInfoMessage onShowForm={() => setShouldShowForm(true)} />
        </View>
    );
}

export default PDFPasswordForm;
