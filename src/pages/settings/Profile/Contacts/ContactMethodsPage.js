import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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

function ContactMethodsPage(props) {
    const styles = useThemeStyles();
    const loginNames = _.keys(props.loginList);
    const navigateBackTo = lodashGet(props.route, 'params.backTo', ROUTES.SETTINGS_PROFILE);

    // Sort the login names by placing the one corresponding to the default contact method as the first item before displaying the contact methods.
    // The default contact method is determined by checking against the session email (the current login).
    const sortedLoginNames = _.sortBy(loginNames, (loginName) => (props.loginList[loginName].partnerUserID === props.session.email ? 0 : 1));

    const loginMenuItems = _.map(sortedLoginNames, (loginName) => {
        const login = props.loginList[loginName];
        const pendingAction = lodashGet(login, 'pendingFields.deletedLogin') || lodashGet(login, 'pendingFields.addedLogin');
        if (!login.partnerUserID && _.isEmpty(pendingAction)) {
            return null;
        }

        let description = '';
        if (props.session.email === login.partnerUserID) {
            description = props.translate('contacts.getInTouch');
        } else if (lodashGet(login, 'errorFields.addedLogin')) {
            description = props.translate('contacts.failedNewContact');
        } else if (!login.validatedDate) {
            description = props.translate('contacts.pleaseVerify');
        }
        let indicator = null;
        if (_.some(lodashGet(login, 'errorFields', {}), (errorField) => !_.isEmpty(errorField))) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        } else if (!login.validatedDate) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
        }

        // Default to using login key if we deleted login.partnerUserID optimistically
        // but still need to show the pending login being deleted while offline.
        const partnerUserID = login.partnerUserID || loginName;
        const menuItemTitle = Str.isSMSLogin(partnerUserID) ? props.formatPhoneNumber(partnerUserID) : partnerUserID;

        return (
            <OfflineWithFeedback
                pendingAction={pendingAction}
                key={partnerUserID}
            >
                <MenuItem
                    title={menuItemTitle}
                    description={description}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(partnerUserID))}
                    brickRoadIndicator={indicator}
                    shouldShowBasicTitle
                    shouldShowRightIcon
                    disabled={!_.isEmpty(pendingAction)}
                />
            </OfflineWithFeedback>
        );
    });

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID={ContactMethodsPage.displayName}
        >
            <HeaderWithBackButton
                title={props.translate('contacts.contactMethods')}
                onBackButtonPress={() => Navigation.goBack(navigateBackTo)}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <View style={[styles.ph5, styles.mv3, styles.flexRow, styles.flexWrap]}>
                    <Text>
                        {props.translate('contacts.helpTextBeforeEmail')}
                        <CopyTextToClipboard
                            text={CONST.EMAIL.RECEIPTS}
                            textStyles={[styles.textBlue]}
                        />
                        <Text>{props.translate('contacts.helpTextAfterEmail')}</Text>
                    </Text>
                </View>
                {loginMenuItems}
                <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                    <Button
                        success
                        text={props.translate('contacts.newContactMethod')}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_NEW_CONTACT_METHOD)}
                        pressOnEnter
                    />
                </FixedFooter>
            </ScrollView>
        </ScreenWrapper>
    );
}

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
