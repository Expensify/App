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
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    credentials: {},
};

const EmailDeliveryFailurePage = (props) => {
    const isSMSLogin = Str.isSMSLogin(props.credentials.login);

    // replacing spaces with "hard spaces" to prevent breaking the number
    const login = isSMSLogin ? props.formatPhoneNumber(props.credentials.login).replace(/ /g, '\u00A0') : props.credentials.login;

    const loginType = (isSMSLogin ? props.translate('common.phone') : props.translate('common.email')).toLowerCase();

    return (
        <>
            <View style={[styles.mt3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <View style={[styles.flex1]}>
                    <Text textBreakStrategy="simple">
                        {props.translate('emailDeliveryFailurePage.ourEmailProvider', props.credentials.login)}
                    </Text>
                    <Text
                        textBreakStrategy="simple"
                        style={[styles.textStrong]}
                    >
                        {props.translate('emailDeliveryFailurePage.confirmThat', props.credentials.login)}
                    </Text>
                    <Text textBreakStrategy="simple">
                        {props.translate('emailDeliveryFailurePage.emailAliases')}
                    </Text>
                    <Text
                        textBreakStrategy="simple"
                        style={[styles.textStrong]}
                    >
                        {props.translate('emailDeliveryFailurePage.whitelistExpensify', props.credentials.login)}
                    </Text>
                    <Text textBreakStrategy="simple">
                        {props.translate('emailDeliveryFailurePage.youCanFindDirections')}
                        <a href="">{props.translate('common.here')}</a>
                        {props.translate('emailDeliveryFailurePage.helpConfigure')}
                    </Text>
                    <Text textBreakStrategy="simple">
                        {props.translate('emailDeliveryFailurePage.onceTheAbove')}
                    </Text>
                </View>
            </View>
            <View style={[styles.mb4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <TouchableOpacity onPress={() => redirectToSignIn()}>
                    <Text style={[styles.link]}>{props.translate('common.back')}</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

EmailDeliveryFailurePage.propTypes = propTypes;
EmailDeliveryFailurePage.defaultProps = defaultProps;
EmailDeliveryFailurePage.displayName = 'ResendValidationForm';

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(EmailDeliveryFailurePage);
