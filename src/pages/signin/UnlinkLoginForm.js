import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import useThemeStyles from '@styles/useThemeStyles';
import * as Session from '@userActions/Session';
import redirectToSignIn from '@userActions/SignInRedirect';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }),

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,

        /** Whether or not the account is validated */
        validated: PropTypes.bool,

        /** The primaryLogin associated with the account */
        primaryLogin: PropTypes.string,
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    credentials: {},
};

function UnlinkLoginForm(props) {
    const styles = useThemeStyles();
    const primaryLogin = Str.isSMSLogin(props.account.primaryLogin) ? Str.removeSMSDomain(props.account.primaryLogin) : props.account.primaryLogin;
    const secondaryLogin = Str.isSMSLogin(props.credentials.login) ? Str.removeSMSDomain(props.credentials.login) : props.credentials.login;

    return (
        <>
            <View style={[styles.mt5]}>
                <Text>{props.translate('unlinkLoginForm.toValidateLogin', {primaryLogin, secondaryLogin})}</Text>
            </View>
            <View style={[styles.mv5]}>
                <Text>{props.translate('unlinkLoginForm.noLongerHaveAccess', {primaryLogin})}</Text>
            </View>
            {!_.isEmpty(props.account.message) && (
                // DotIndicatorMessage mostly expects onyxData errors so we need to mock an object so that the messages looks similar to prop.account.errors
                <DotIndicatorMessage
                    style={[styles.mb5, styles.flex0]}
                    type="success"
                    messages={{0: props.translate(props.account.message)}}
                />
            )}
            {!_.isEmpty(props.account.errors) && (
                <DotIndicatorMessage
                    style={[styles.mb5]}
                    type="error"
                    messages={props.account.errors}
                />
            )}
            <View style={[styles.mb4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <PressableWithFeedback
                    accessibilityLabel={props.translate('common.back')}
                    onPress={() => redirectToSignIn()}
                >
                    <Text style={[styles.link]}>{props.translate('common.back')}</Text>
                </PressableWithFeedback>
                <Button
                    medium
                    success
                    text={props.translate('unlinkLoginForm.unlink')}
                    isLoading={props.account.isLoading && props.account.loadingForm === CONST.FORMS.UNLINK_LOGIN_FORM}
                    onPress={() => Session.requestUnlinkValidationLink()}
                    isDisabled={props.network.isOffline || !_.isEmpty(props.account.message)}
                />
            </View>
        </>
    );
}

UnlinkLoginForm.propTypes = propTypes;
UnlinkLoginForm.defaultProps = defaultProps;
UnlinkLoginForm.displayName = 'UnlinkLoginForm';

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(UnlinkLoginForm);
