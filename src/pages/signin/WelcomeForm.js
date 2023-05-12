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
import networkPropTypes from '../../components/networkPropTypes';
import {withNetwork} from '../../components/OnyxProvider';
import CONST from '../../CONST';
import Terms from './Terms';

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

    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    credentials: {},
    preferredLocale: CONST.LOCALES.DEFAULT,
};

const WelcomeForm = (props) => {
    return (
        <>
            <View style={[styles.mb4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <TouchableOpacity onPress={() => redirectToSignIn()}>
                    <Text style={[styles.link]}>{props.translate('common.back')}</Text>
                </TouchableOpacity>
                <Button
                    medium
                    success
                    text={props.translate('welcomeForm.join')}
                    isLoading={props.account.isLoading}
                    onPress={() => Session.signUp(props.preferredLocale)}
                    isDisabled={props.network.isOffline || !_.isEmpty(props.account.message)}
                />
            </View>
            <View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
};

WelcomeForm.propTypes = propTypes;
WelcomeForm.defaultProps = defaultProps;
WelcomeForm.displayName = 'UnlinkLoginForm';

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(WelcomeForm);
