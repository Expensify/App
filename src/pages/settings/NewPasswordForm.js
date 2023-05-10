import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import TextInput from '../../components/TextInput';
import * as ComponentUtils from '../../libs/ComponentUtils';

const propTypes = {
    /** String to control the first password box in the form */
    password: PropTypes.string.isRequired,

    /** Function to update the first password box in the form */
    updatePassword: PropTypes.func.isRequired,

    /** Callback function called with boolean value for if the password form is valid  */
    updateIsFormValid: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const NewPasswordForm = (props) => {
    const [passwordHintError, setPasswordHintError] = useState(false);

    const isValidPassword = () => props.password.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING);

    const onBlurNewPassword = () => {
        if (passwordHintError) {
            return;
        }
        if (props.password && !isValidPassword()) {
            setPasswordHintError(true);
        }
    };

    /**
     * checks if the password invalid
     * @returns {Boolean}
     */
    const isInvalidPassword = () => passwordHintError && props.password && !isValidPassword();

    useEffect(() => {
        props.updateIsFormValid(isValidPassword());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.password]);

    return (
        <View style={styles.mb6}>
            <TextInput
                autoFocus
                label={`${props.translate('setPasswordPage.enterPassword')}`}
                secureTextEntry
                autoComplete={ComponentUtils.NEW_PASSWORD_AUTOCOMPLETE_TYPE}
                textContentType="newPassword"
                value={props.password}
                onChangeText={(password) => props.updatePassword(password)}
                onBlur={onBlurNewPassword}
            />
            <Text style={[styles.formHelp, styles.mt1, isInvalidPassword() && styles.formError]}>{props.translate('setPasswordPage.newPasswordPrompt')}</Text>
        </View>
    );
};

NewPasswordForm.propTypes = propTypes;
NewPasswordForm.displayName = 'NewPasswordForm';

export default withLocalize(NewPasswordForm);
