import Str from 'expensify-common/lib/str';
import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import compose from '../../../../libs/compose';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import MenuItem from '../../../../components/MenuItem';
import DotIndicatorMessage from '../../../../components/DotIndicatorMessage';
import styles from '../../../../styles/styles';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import Text from '../../../../components/Text';

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

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** passed via route /settings/profile/contact-methods/:contactMethod/details */
            contactMethod: PropTypes.string,
        }),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    loginList: {},
};

const ContactMethodDetailsPage = props => {
    const contactMethod = decodeURIComponent(lodashGet(props.route, 'params.contactMethod'));
    const login = props.loginList[contactMethod];
    if (!contactMethod || !login) {
        Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS);
    }

    console.log({contactMethod, login})

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={Str.removeSMSDomain(contactMethod)}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView>
                {login.validatedDate ? (
                    <Text style={[styles.ph8]}>
                        {props.translate('contacts.tempContactVerifiedText')}
                    </Text>
                ) : (
                    <>
                        <MenuItem
                            title="Resend verification"
                            icon={Expensicons.Mail}
                            iconRight={Expensicons.Checkmark}
                            shouldShowRightIcon
                            success
                        />
                        <DotIndicatorMessage style={[styles.ph8, styles.ml3]} messages={{0: props.translate('contacts.clickVerificationLink')}} type="success" />
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    )
};

ContactMethodDetailsPage.propTypes = propTypes;
ContactMethodDetailsPage.defaultProps = defaultProps;
ContactMethodDetailsPage.displayName = 'ContactMethodDetailsPage';

export default compose(
    withLocalize,
    withOnyx({
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
    }),
)(ContactMethodDetailsPage);
