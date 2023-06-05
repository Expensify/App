import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
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
import * as UserUtils from '../../libs/UserUtils';
import networkPropTypes from '../../components/networkPropTypes';
import {withNetwork} from '../../components/OnyxProvider';
import DotIndicatorMessage from '../../components/DotIndicatorMessage';
import PressableWithFeedback from '../../components/Pressable/PressableWithFeedback';
import CONST from '../../CONST';

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
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    credentials: {},
    account: {},
};

const ResendValidationForm = (props) => {
    const isSMSLogin = Str.isSMSLogin(props.credentials.login);

    // replacing spaces with "hard spaces" to prevent breaking the number
    const login = isSMSLogin ? props.formatPhoneNumber(props.credentials.login).replace(/ /g, '\u00A0') : props.credentials.login;

    const loginType = (isSMSLogin ? props.translate('common.phone') : props.translate('common.email')).toLowerCase();

    return (
        <>
            <View style={[styles.mt3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <Avatar
                    source={UserUtils.getDefaultAvatar(props.credentials.login)}
                    imageStyles={[styles.mr2]}
                />
                <View style={[styles.flex1]}>
                    <Text
                        textBreakStrategy="simple"
                        style={[styles.textStrong]}
                    >
                        {login}
                    </Text>
                </View>
            </View>
            <View style={[styles.mv5]}>
                <Text>{props.translate('resendValidationForm.weSentYouMagicSignInLink', {login, loginType})}</Text>
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
                    onPress={() => redirectToSignIn()}
                    accessibilityRole="button"
                    accessibilityLabel={props.translate('common.back')}
                    // disable hover dim for switch
                    hoverDimmingValue={1}
                    pressDimmingValue={0.2}
                >
                    <Text style={[styles.link]}>{props.translate('common.back')}</Text>
                </PressableWithFeedback>
                <Button
                    medium
                    success
                    text={props.translate('resendValidationForm.resendLink')}
                    isLoading={props.account.isLoading && props.account.loadingForm === CONST.FORMS.RESEND_VALIDATION_FORM}
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
