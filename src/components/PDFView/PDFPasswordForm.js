import _ from 'underscore';
import React, {useState, useRef, useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import Button from '../Button';
import Text from '../Text';
import TextInput from '../TextInput';
import styles from '../../styles/styles';
import PDFInfoMessage from './PDFInfoMessage';
import shouldDelayFocus from '../../libs/shouldDelayFocus';
import * as Browser from '../../libs/Browser';
import CONST from '../../CONST';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** If the submitted password is invalid (show an error message) */
    isPasswordInvalid: PropTypes.bool,

    /** If loading indicator should be shown */
    shouldShowLoadingIndicator: PropTypes.bool,

    /** Notify parent that the password form has been submitted */
    onSubmit: PropTypes.func,

    /** Notify parent that the password has been updated/edited */
    onPasswordUpdated: PropTypes.func,

    /** Notify parent that a text field has been focused or blurred */
    onPasswordFieldFocused: PropTypes.func,

    /** Should focus to the password input  */
    isFocused: PropTypes.bool.isRequired,
};

const defaultProps = {
    isPasswordInvalid: false,
    shouldShowLoadingIndicator: false,
    onSubmit: () => {},
    onPasswordUpdated: () => {},
    onPasswordFieldFocused: () => {},
};

function PDFPasswordForm({isFocused, isPasswordInvalid, shouldShowLoadingIndicator, onSubmit, onPasswordUpdated, onPasswordFieldFocused}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    const [password, setPassword] = useState('');
    const [validationErrorText, setValidationErrorText] = useState('');
    const [shouldShowForm, setShouldShowForm] = useState(false);
    const textInputRef = useRef(null);

    const focusTimeoutRef = useRef(null);

    const errorText = useMemo(() => {
        if (isPasswordInvalid) {
            return translate('attachmentView.passwordIncorrect');
        }
        if (!_.isEmpty(validationErrorText)) {
            return translate(validationErrorText);
        }
        return '';
    }, [isPasswordInvalid, translate, validationErrorText]);

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
            textInputRef.current.focus();
        }, CONST.ANIMATED_TRANSITION);
        return () => {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    }, [isFocused]);

    const updatePassword = (newPassword) => {
        onPasswordUpdated(newPassword);
        if (!_.isEmpty(newPassword) && validationErrorText) {
            setValidationErrorText('');
        }
        setPassword(newPassword);
    };

    const validate = () => {
        if (!isPasswordInvalid && !_.isEmpty(password)) {
            return true;
        }
        if (_.isEmpty(password)) {
            setValidationErrorText('attachmentView.passwordRequired');
        }
        return false;
    };

    const submitPassword = () => {
        if (!validate()) {
            return;
        }
        onSubmit(password);
    };

    return shouldShowForm ? (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.getPDFPasswordFormStyle(isSmallScreenWidth)}
            contentContainerStyle={styles.p5}
        >
            <View style={styles.mb4}>
                <Text>{translate('attachmentView.pdfPasswordForm.formLabel')}</Text>
            </View>
            <TextInput
                ref={textInputRef}
                label={translate('common.password')}
                accessibilityLabel={translate('common.password')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                /**
                 * This is a workaround to bypass Safari's autofill odd behaviour.
                 * This tricks the browser not to fill the username somewhere else and still fill the password correctly.
                 */
                autoComplete={Browser.getBrowser() === CONST.BROWSER.SAFARI ? 'username' : 'off'}
                autoCorrect={false}
                textContentType="password"
                onChangeText={updatePassword}
                returnKeyType="done"
                onSubmitEditing={submitPassword}
                errorText={errorText}
                onFocus={() => onPasswordFieldFocused(true)}
                onBlur={() => onPasswordFieldFocused(false)}
                autoFocus
                shouldDelayFocus={shouldDelayFocus}
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
            />
        </ScrollView>
    ) : (
        <View style={[styles.flex1, styles.justifyContentCenter]}>
            <PDFInfoMessage onShowForm={() => setShouldShowForm(true)} />
        </View>
    );
}

PDFPasswordForm.propTypes = propTypes;
PDFPasswordForm.defaultProps = defaultProps;
PDFPasswordForm.displayName = 'PDFPasswordForm';

export default PDFPasswordForm;
