import _ from 'underscore';
import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import Button from '../Button';
import Text from '../Text';
import TextInput from '../TextInput';
import styles from '../../styles/styles';
import PDFInfoMessage from './PDFInfoMessage';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import shouldDelayFocus from '../../libs/shouldDelayFocus';
import * as Browser from '../../libs/Browser';
import CONST from '../../CONST';

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

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isPasswordInvalid: false,
    shouldShowLoadingIndicator: false,
    onSubmit: () => {},
    onPasswordUpdated: () => {},
    onPasswordFieldFocused: () => {},
};

function PDFPasswordForm(props) {
    const [password, setPassword] = useState('');
    const [validationErrorText, setValidationErrorText] = useState('');
    const [shouldShowForm, setShouldShowForm] = useState(false);
    const textInputRef = useRef(null);

    useEffect(() => {
        if (!props.isFocused || !textInputRef.current) return;
        textInputRef.current.focus();
    }, [props.isFocused]);

    const getErrorText = () => {
        if (props.isPasswordInvalid) {
            return props.translate('attachmentView.passwordIncorrect');
        }
        if (!_.isEmpty(validationErrorText)) {
            return props.translate(validationErrorText);
        }

        return '';
    };

    const updatePassword = (passwrd) => {
        props.onPasswordUpdated(passwrd);
        if (!_.isEmpty(passwrd) && validationErrorText) {
            setValidationErrorText('');
        }
        setPassword(passwrd);
    };

    const validate = () => {
        if (!props.isPasswordInvalid && !_.isEmpty(password)) {
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
        props.onSubmit(password);
    };

    const validateAndNotifyPasswordBlur = () => {
        validate();
        props.onPasswordFieldFocused(false);
    };

    const showForm = () => {
        setShouldShowForm(true);
    };

    const errorText = getErrorText();
    const containerStyle = props.isSmallScreenWidth ? [styles.flex1, styles.w100] : styles.pdfPasswordForm.wideScreenWidth;

    return (
        <>
            {shouldShowForm ? (
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    style={containerStyle}
                    contentContainerStyle={styles.p5}
                >
                    <View style={styles.mb4}>
                        <Text>{props.translate('attachmentView.pdfPasswordForm.formLabel')}</Text>
                    </View>
                    <TextInput
                        ref={textInputRef}
                        label={props.translate('common.password')}
                        accessibilityLabel={props.translate('common.password')}
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
                        onFocus={() => props.onPasswordFieldFocused(true)}
                        onBlur={validateAndNotifyPasswordBlur}
                        autoFocus
                        shouldDelayFocus={shouldDelayFocus}
                        secureTextEntry
                    />
                    <Button
                        text={props.translate('common.confirm')}
                        onPress={submitPassword}
                        style={styles.mt4}
                        isLoading={props.shouldShowLoadingIndicator}
                        pressOnEnter
                    />
                </ScrollView>
            ) : (
                <View style={[styles.flex1, styles.justifyContentCenter]}>
                    <PDFInfoMessage onShowForm={showForm} />
                </View>
            )}
        </>
    );
}

PDFPasswordForm.propTypes = propTypes;
PDFPasswordForm.defaultProps = defaultProps;

export default compose(withWindowDimensions, withLocalize)(PDFPasswordForm);
