import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import CONST from '../../../../CONST';
import compose from '../../../../libs/compose';
import Navigation from '../../../../libs/Navigation/Navigation';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import LoginField from './LoginField';
import MenuItem from '../../../../components/MenuItem';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import CopyTextToClipboard from '../../../../components/CopyTextToClipboard';

const propTypes = {
    /* Onyx Props */

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** Value of partner name */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** Date of when login was validated */
        validatedDate: PropTypes.string,
    }),

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    loginList: {},
};

const ContactMethodsPage = props => {
    let hasPhoneNumberLogin = false;
    let hasEmailLogin = false;

    const loginMenuItems = _.map(props.loginList, (login) => {
        if (!login.partnerUserID) return null;

        let description = '';
        if (props.session.email === login.partnerUserID) {
            description = props.translate('contacts.getInTouch');
        } else if (!login.validatedDate) {
            description = props.translate('contacts.pleaseVerify');
        }
        let indicator = null;
        if (!_.isEmpty(login.errorFields)) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        } else if (!login.validatedDate) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.GREEN;
        }

        // Temporary checks to determine if we need to show specific LoginField
        // components. This check will be removed soon.
        if (Str.isValidPhone(Str.removeSMSDomain(login.partnerUserID))) {
            hasPhoneNumberLogin = true;
        } else if (Str.isValidEmail(login.partnerUserID)) {
            hasEmailLogin = true;
        }
        return (
            <MenuItem
                title={Str.removeSMSDomain(login.partnerUserID)}
                description={description}
                onPress={() => Navigation.navigate(ROUTES.getEditContactMethodRoute(login.partnerUserID))}
                brickRoadIndicator={indicator}
                shouldShowBasicTitle
                shouldShowRightIcon
                key={login.partnerUserID}
            />
        )
    });

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('contacts.contactMethods')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView>
                <View style={[styles.ph8, styles.mv3, styles.flexRow, styles.flexWrap]}>
                    <Text>
                        {props.translate('contacts.helpTextBeforeEmail')}
                        <CopyTextToClipboard
                            text="receipts@expensify.com"
                            textStyles={[styles.textBlue]}
                        />
                        <Text>{props.translate('contacts.helpTextAfterEmail')}</Text>
                    </Text>
                </View>
                {loginMenuItems}
                {/* The below fields will be removed soon, when we implement the new Add Contact Method page */}
                {!hasEmailLogin && (
                    <LoginField
                        label={props.translate('profilePage.emailAddress')}
                        type="email"
                        login={{}}
                    />
                )}
                {!hasPhoneNumberLogin && (
                    <LoginField
                        label={props.translate('common.phoneNumber')}
                        type="phone"
                        login={{}}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

ContactMethodsPage.propTypes = propTypes;
ContactMethodsPage.defaultProps = defaultProps;
ContactMethodsPage.displayName = 'ContactMethodsPage';

export default compose(
    withLocalize,
    withOnyx({
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ContactMethodsPage);
