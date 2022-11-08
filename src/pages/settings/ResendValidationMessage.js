import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import DotIndicatorMessage from '../../components/DotIndicatorMessage';
import OfflineIndicator from '../../components/OfflineIndicator';
import Text from '../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';

const propTypes = {
    /* Onyx Props */

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }).isRequired,

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,

        /** Whether or not the account is validated */
        validated: PropTypes.bool,
    }),
    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};

const ResendValidationMessage = (props) => {
    const isSMSLogin = Str.isSMSLogin(props.credentials.login);
    const login = isSMSLogin ? props.toLocalPhone(Str.removeSMSDomain(props.credentials.login)) : props.credentials.login;
    const loginType = (isSMSLogin ? props.translate('common.phone') : props.translate('common.email')).toLowerCase();

    return (
        <>
            <View style={[styles.mv5]}>
                <Text>
                    {props.translate('resendValidationForm.weSentYouMagicSignInLink', {login, loginType})}
                </Text>
            </View>
            {!_.isEmpty(props.account.message) && (

                // DotIndicatorMessage mostly expects onyxData errors so we need to mock an object so that the messages looks similar to prop.account.errors
                <DotIndicatorMessage style={[styles.mb5]} type="success" messages={{0: props.account.message}} />
            )}
            {!_.isEmpty(props.account.errors) && (
                <DotIndicatorMessage style={[styles.mb5]} type="error" messages={props.account.errors} />
            )}
            <OfflineIndicator containerStyles={[styles.mv1]} />
        </>
    );
};

ResendValidationMessage.propTypes = propTypes;
ResendValidationMessage.defaultProps = defaultProps;
ResendValidationMessage.displayName = 'ResendValidationMessage';

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(ResendValidationMessage);
