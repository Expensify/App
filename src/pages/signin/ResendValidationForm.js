import React from 'react';
import _ from 'underscore';
import {TouchableOpacity, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import Text from '../../components/Text';
import * as Session from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import redirectToSignIn from '../../libs/actions/SignInRedirect';
import Avatar from '../../components/Avatar';
import * as ReportUtils from '../../libs/ReportUtils';
import networkPropTypes from '../../components/networkPropTypes';
import {withNetwork} from '../../components/OnyxProvider';
import DotIndicatorMessage from '../../components/DotIndicatorMessage';

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

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};

const ResendValidationForm = (props) => {
    const isSMSLogin = Str.isSMSLogin(props.credentials.login);
    const login = isSMSLogin ? props.toLocalPhone(Str.removeSMSDomain(props.credentials.login)) : props.credentials.login;
    const loginType = (isSMSLogin ? props.translate('common.phone') : props.translate('common.email')).toLowerCase();

    return (
        <>
            <View style={[styles.mt3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <Avatar
                    source={ReportUtils.getDefaultAvatar(props.credentials.login)}
                    imageStyles={[styles.mr2]}
                />
                <View style={[styles.flex1]}>
                    <Text style={[styles.textStrong]}>
                        {login}
                    </Text>
                </View>
            </View>
            <View style={[styles.mv5]}>
                <Text>
                    {props.translate('resendValidationForm.weSentYouMagicSignInLink', {login, loginType})}
                </Text>
            </View>
            {!_.isEmpty(props.account.message) && (

                // DotIndicatorMessage mostly expects onyxData errors so we need to mock an object so that the messages looks similar to prop.account.errors
                <DotIndicatorMessage style={[styles.mb5, styles.flex0]} type="success" messages={{0: props.account.message}} />
            )}
            {!_.isEmpty(props.account.errors) && (
                <DotIndicatorMessage style={[styles.mb5]} type="error" messages={props.account.errors} />
            )}
            <View style={[styles.mb4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <TouchableOpacity onPress={() => redirectToSignIn()}>
                    <Text style={[styles.link]}>
                        {props.translate('common.back')}
                    </Text>
                </TouchableOpacity>
                <Button
                    medium
                    success
                    text={props.translate('resendValidationForm.resendLink')}
                    isLoading={props.account.isLoading}
                    onPress={() => (props.account.validated ? Session.resendResetPassword() : Session.resendValidationLink())}
                    isDisabled={props.network.isOffline}
                />
            </View>
        </>
    );
};

ResendValidationForm.propTypes = propTypes;
ResendValidationForm.defaultProps = defaultProps;
ResendValidationForm.displayName = 'ResendValidationForm';

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(ResendValidationForm);
