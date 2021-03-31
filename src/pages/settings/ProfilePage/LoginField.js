import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import {Plus} from '../../../components/Icon/Expensicons';
import Icon from '../../../components/Icon';
import ROUTES from '../../../ROUTES';
import Navigation from '../../../libs/Navigation/Navigation';
import {resendValidateCode} from '../../../libs/actions/User';

const propTypes = {
    // Label to display on login form
    label: PropTypes.string.isRequired,

    // Type associated with the login
    type: PropTypes.oneOf(['email', 'phone']).isRequired,

    // Login associated with the user
    login: PropTypes.shape({
        partnerUserID: PropTypes.string,
        validatedDate: PropTypes.string,
    }).isRequired,
};
const LoginField = ({
    label,
    login,
    type,
}) => {
    let note;
    if (type === 'phone') {
        // No phone number
        if (!login.partnerUserID) {
            note = 'Add your phone number to settle up via Venmo.';

            // Has unvalidated phone number
        } else if (!login.validatedDate) {
            note = 'The number has not yet been validated. Click the button to resend the validation link via text.';

            // Has verified phone number
        } else {
            note = 'Use your phone number to settle up via Venmo.';
        }

        // Has unvalidated email
    } else if (login.partnerUserID && !login.validatedDate) {
        note = 'The email has not yet been validated. Click the button to resend the validation link via text.';
    }

    return (
        <View style={styles.mb6}>
            <Text style={styles.formLabel}>{label}</Text>
            {!login.partnerUserID ? (
                <Pressable
                    style={[styles.createMenuItem, styles.ph0]}
                    onPress={() => Navigation.navigate(type === 'phone'
                        ? ROUTES.SETTINGS_ADD_PHONE
                        : ROUTES.SETTINGS_ADD_EMAIL)}
                >
                    <View style={styles.flexRow}>
                        <View style={styles.createMenuIcon}>
                            <Icon src={Plus} />
                        </View>
                        <View style={styles.justifyContentCenter}>
                            <Text style={[styles.createMenuText, styles.ml3]}>
                                {`Add ${label}`}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            ) : (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    <Text style={[styles.textP]} numberOfLines={1}>
                        {login.partnerUserID}
                    </Text>
                    {!login.validatedDate && (
                        <Pressable
                            style={styles.button}
                            onPress={() => resendValidateCode(login.partnerUserID)}
                        >
                            <Text style={styles.createMenuText}>
                                Resend
                            </Text>
                        </Pressable>
                    )}
                </View>
            )}
            {note && (
                <Text style={[styles.textLabel, styles.colorMuted]}>
                    {note}
                </Text>
            )}
        </View>
    );
};

LoginField.propTypes = propTypes;
LoginField.displayName = 'LoginField';

export default LoginField;
