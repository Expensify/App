import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
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
import OfflineWithFeedback from '../../../../components/OfflineWithFeedback';

const propTypes = {
    /* Onyx Props */

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** The partner creating the account. It depends on the source: website, mobile, integrations, ... */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** The date when the login was validated, used to show the brickroad status */
        validatedDate: PropTypes.string,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),

        /** Field-specific pending states for offline UI status */
        pendingFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    loginList: {},
    session: {
        email: null,
    },
};

const ContactMethodsPage = (props) => {
    let hasPhoneNumberLogin = false;
    let hasEmailLogin = false;

    const loginMenuItems = _.map(props.loginList, (login, loginName) => {
        const pendingAction = lodashGet(login, 'pendingFields.deletedLogin', null);
        if (!login.partnerUserID && _.isEmpty(pendingAction)) {
            return null;
        }

        let description = '';
        if (props.session.email === login.partnerUserID) {
            description = props.translate('contacts.getInTouch');
        } else if (!login.validatedDate) {
            description = props.translate('contacts.pleaseVerify');
        }
        let indicator = null;
        if (_.some(lodashGet(login, 'errorFields', {}), errorField => !_.isEmpty(errorField))) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        } else if (!login.validatedDate) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
        }

        // Temporary checks to determine if we need to show specific LoginField
        // components. This check will be removed soon by this follow up PR:
        // https://github.com/Expensify/App/pull/15330
        // Also we still use login.partnerUserID here even though it could have been
        // deleted optimistically because if the deletion is pending, we want to show
        // the option to add a new phone or email login, so we don't want to find
        // that login type in the list here.
        if (Str.isValidPhone(Str.removeSMSDomain(login.partnerUserID))) {
            hasPhoneNumberLogin = true;
        } else if (Str.isValidEmail(login.partnerUserID)) {
            hasEmailLogin = true;
        }

        // Default to using login key if we deleted login.partnerUserID optimistically
        // but still need to show the pending login being deleted while offline.
        const partnerUserID = login.partnerUserID || loginName;
        return (
            <OfflineWithFeedback
                pendingAction={pendingAction}
                key={partnerUserID}
            >
                <MenuItem
                    title={Str.removeSMSDomain(partnerUserID)}
                    description={description}
                    onPress={() => Navigation.navigate(ROUTES.getEditContactMethodRoute(partnerUserID))}
                    brickRoadIndicator={indicator}
                    shouldShowBasicTitle
                    shouldShowRightIcon
                    disabled={!_.isEmpty(pendingAction)}
                />
            </OfflineWithFeedback>
        );
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
                <View style={[styles.ph5, styles.mv3, styles.flexRow, styles.flexWrap]}>
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
                        type={CONST.LOGIN_TYPE.EMAIL}
                        login={{}}
                    />
                )}
                {!hasPhoneNumberLogin && (
                    <LoginField
                        label={props.translate('common.phoneNumber')}
                        type={CONST.LOGIN_TYPE.PHONE}
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
