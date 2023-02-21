import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
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
import OfflineWithFeedback from '../../../../components/OfflineWithFeedback';
import ConfirmModal from '../../../../components/ConfirmModal';
import * as User from '../../../../libs/actions/User';

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
    const loginData = props.loginList[contactMethod];
    if (!contactMethod || !loginData) {
        Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS);
    }

    const isDefaultContactMethod = (props.session.email === loginData.partnerUserID);

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={Str.removeSMSDomain(contactMethod)}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView>
                <ConfirmModal
                    title="Remove contact method"
                    onConfirm={() => User.deleteContactMethod(contactMethod)}
                    onCancel={() => console.log('hi')}
                    prompt="Are you sure you want to remove this contact method? This action cannot be undone."
                    confirmText="Yes, continue"
                    isVisible={false}
                />
                {isDefaultContactMethod && (
                    <Text>
                        This is your current default contact method. You will not be able to delete this contact method until you set an alternative default by selecting another contact method and pressing “Set as default”.
                    </Text>
                )}
                {!loginData.validatedDate && (
                    <>
                        <MenuItem
                            title="Resend verification"
                            icon={Expensicons.Mail}
                            iconRight={Expensicons.Checkmark}
                            onPress={() => console.log('hi')}
                            shouldShowRightIcon
                            success
                        />
                        <DotIndicatorMessage style={[styles.ph8, styles.mv2, styles.ml3]} messages={{0: props.translate('contacts.clickVerificationLink')}} type="success" />
                    </>
                )}
                <OfflineWithFeedback
                    pendingAction={lodashGet(loginData, 'pendingFields.deletedLogin', null)}
                    errors={lodashGet(loginData, 'errorFields.deletedLogin', null)}
                    errorRowStyles={[styles.mt6]}
                    onClose={() => User.clearContactMethodErrors(contactMethod, 'deletedLogin')}
                >
                    <MenuItem
                        title="Remove"
                        icon={Expensicons.Trashcan}
                        onPress={() => User.deleteContactMethod(contactMethod, loginData)}
                        disabled={isDefaultContactMethod}
                    />
                </OfflineWithFeedback>
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
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ContactMethodDetailsPage);
