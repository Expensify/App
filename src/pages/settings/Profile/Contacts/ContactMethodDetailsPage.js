import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import React, {Component} from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import compose from '../../../../libs/compose';
import ONYXKEYS from '../../../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import MenuItem from '../../../../components/MenuItem';
import styles from '../../../../styles/styles';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import Text from '../../../../components/Text';
import OfflineWithFeedback from '../../../../components/OfflineWithFeedback';
import DotIndicatorMessage from '../../../../components/DotIndicatorMessage';
import ConfirmModal from '../../../../components/ConfirmModal';
import * as User from '../../../../libs/actions/User';
import TextInput from '../../../../components/TextInput';
import CONST from '../../../../CONST';
import Icon from '../../../../components/Icon';
import colors from '../../../../styles/colors';
import Button from '../../../../components/Button';
import * as ErrorUtils from '../../../../libs/ErrorUtils';
import themeColors from '../../../../styles/themes/default';
import NotFoundPage from '../../../ErrorPage/NotFoundPage';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import Permissions from '../../../../libs/Permissions';

const propTypes = {
    /* Onyx Props */

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** Value of partner name */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** Date when login was validated */
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

    /** User's security group IDs by domain */
    myDomainSecurityGroups: PropTypes.objectOf(PropTypes.string),

    /** All of the user's security groups and their settings */
    securityGroups: PropTypes.shape({
        hasRestrictedPrimaryLogin: PropTypes.bool,
    }),

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Passed via route /settings/profile/contact-methods/:contactMethod/details */
            contactMethod: PropTypes.string,
        }),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    loginList: {},
    session: {
        email: null,
    },
    myDomainSecurityGroups: {},
    securityGroups: {},
    route: {
        params: {
            contactMethod: '',
        },
    },
};

class ContactMethodDetailsPage extends Component {
    constructor(props) {
        super(props);

        this.deleteContactMethod = this.deleteContactMethod.bind(this);
        this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
        this.confirmDeleteAndHideModal = this.confirmDeleteAndHideModal.bind(this);
        this.resendValidateCode = this.resendValidateCode.bind(this);
        this.getContactMethod = this.getContactMethod.bind(this);
        this.validateAndSubmitCode = this.validateAndSubmitCode.bind(this);
        this.setAsDefault = this.setAsDefault.bind(this);

        this.state = {
            formError: '',
            isDeleteModalOpen: false,
            validateCode: '',
        };
    }

    /**
     * Gets the current contact method from the route params
     *
     * @returns {string}
     */
    getContactMethod() {
        return decodeURIComponent(lodashGet(this.props.route, 'params.contactMethod'));
    }

    /**
     * Checks if the user is allowed to change their default contact method by looking at
     * their security group settings on their primary domain.
     *
     * @returns {Boolean}
     */
    getCanChangeDefaultContactMethod() {
        const domainName = Str.extractEmailDomain(this.props.session.email);
        const primaryDomainSecurityGroupID = lodashGet(this.props.myDomainSecurityGroups, domainName);

        // If there's no security group associated with the user for the primary domain,
        // default to allowing the user to change their default contact method.
        if (!primaryDomainSecurityGroupID) {
            return true;
        }

        // Return true if there's no security group with 'hasRestrictedPrimaryLogin' set to true.
        return !lodashGet(this.props.securityGroups, [
            `${ONYXKEYS.COLLECTION.SECURITY_GROUP}${primaryDomainSecurityGroupID}`,
            'hasRestrictedPrimaryLogin',
        ], false);
    }

    /**
     * Deletes the contact method if it has errors. Otherwise, it shows the confirmation alert and deletes it only if the user confirms.
     */
    deleteContactMethod() {
        if (!_.isEmpty(lodashGet(this.props.loginList, [this.getContactMethod(), 'errorFields'], {}))) {
            User.deleteContactMethod(this.getContactMethod());
            return;
        }
        this.toggleDeleteModal(true);
    }

    /**
     * Toggle delete confirm modal visibility
     * @param {Boolean} isOpen
     */
    toggleDeleteModal(isOpen) {
        this.setState({isDeleteModalOpen: isOpen});
    }

    /**
     * Delete the contact method and hide the modal
     */
    confirmDeleteAndHideModal() {
        this.toggleDeleteModal(false);
        User.deleteContactMethod(this.getContactMethod());
    }

    /**
     * Request a validate code / magic code be sent to verify this contact method
     */
    resendValidateCode() {
        User.requestContactMethodValidateCode(this.getContactMethod());
    }

    /**
     * Attempt to validate this contact method
     */
    validateAndSubmitCode() {
        if (!this.state.validateCode) {
            this.setState({formError: 'validateCodeForm.error.pleaseFillMagicCode'});
        } else if (!ValidationUtils.isValidValidateCode(this.state.validateCode)) {
            this.setState({formError: 'validateCodeForm.error.incorrectMagicCode'});
        } else {
            this.setState({formError: ''});
            User.validateSecondaryLogin(this.getContactMethod(), this.state.validateCode);
        }
    }

    /**
     * Attempt to set this contact method as user's "Default contact method"
     */
    setAsDefault() {
        User.setContactMethodAsDefault(this.getContactMethod());
    }

    render() {
        const contactMethod = this.getContactMethod();
        const loginData = this.props.loginList[contactMethod];
        if (!contactMethod || !loginData) {
            return <NotFoundPage />;
        }

        const isDefaultContactMethod = this.props.session.email === loginData.partnerUserID;
        const hasMagicCodeBeenSent = lodashGet(this.props.loginList, [contactMethod, 'validateCodeSent'], false);
        const formErrorText = this.state.formError ? this.props.translate(this.state.formError) : '';
        const isFailedAddContactMethod = Boolean(lodashGet(loginData, 'errorFields.addedLogin'));

        // Users are only allowed to change their default contact method to the current one if:
        // 1. This contact method is not already their default
        // 2. This contact method is validated
        // 3. Default contact method switching is allowed by their domain security group (if this exists)
        // 4. The user is on the passwordless beta
        const canChangeDefaultContactMethod = !isDefaultContactMethod
            && loginData.validatedDate
            && this.getCanChangeDefaultContactMethod()
            && Permissions.canUsePasswordlessLogins(this.props.betas);

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={Str.removeSMSDomain(contactMethod)}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <ScrollView keyboardShouldPersistTaps="handled">
                    <ConfirmModal
                        title={this.props.translate('contacts.removeContactMethod')}
                        onConfirm={this.confirmDeleteAndHideModal}
                        onCancel={() => this.toggleDeleteModal(false)}
                        prompt={this.props.translate('contacts.removeAreYouSure')}
                        confirmText={this.props.translate('common.yesContinue')}
                        isVisible={this.state.isDeleteModalOpen}
                        danger
                    />
                    {isFailedAddContactMethod && <DotIndicatorMessage style={[styles.mh5]} messages={ErrorUtils.getLatestErrorField(loginData, 'addedLogin')} type="error" />}
                    {!loginData.validatedDate && !isFailedAddContactMethod && (
                        <View style={[styles.ph5, styles.mt3, styles.mb7]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb1]}>
                                <Icon src={Expensicons.DotIndicator} fill={colors.green} />
                                <View style={[styles.flex1, styles.ml4]}>
                                    <Text>
                                        {this.props.translate('contacts.enterMagicCode', {contactMethod})}
                                    </Text>
                                </View>
                            </View>
                            <TextInput
                                label={this.props.translate('common.magicCode')}
                                name="validateCode"
                                value={this.state.validateCode}
                                onChangeText={text => this.setState({validateCode: text})}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                errorText={formErrorText}
                            />
                            <OfflineWithFeedback
                                pendingAction={lodashGet(loginData, 'pendingFields.validateCodeSent', null)}
                                errors={ErrorUtils.getLatestErrorField(loginData, 'validateCodeSent')}
                                errorRowStyles={[styles.mt2]}
                                onClose={() => User.clearContactMethodErrors(contactMethod, 'validateCodeSent')}
                            >
                                <View
                                    style={[styles.mt2, styles.dFlex, styles.flexRow]}
                                >
                                    <Text style={[styles.link, styles.mr1]} onPress={this.resendValidateCode}>
                                        {this.props.translate('contacts.resendMagicCode')}
                                    </Text>
                                    {hasMagicCodeBeenSent && (
                                        <Icon src={Expensicons.Checkmark} fill={colors.green} />
                                    )}
                                </View>
                            </OfflineWithFeedback>
                            <OfflineWithFeedback
                                pendingAction={lodashGet(loginData, 'pendingFields.validateLogin', null)}
                                errors={ErrorUtils.getLatestErrorField(loginData, 'validateLogin')}
                                errorRowStyles={[styles.mt2]}
                                onClose={() => User.clearContactMethodErrors(contactMethod, 'validateLogin')}
                            >
                                <Button
                                    text={this.props.translate('common.verify')}
                                    onPress={this.validateAndSubmitCode}
                                    style={[styles.mt4]}
                                    success
                                    pressOnEnter
                                />
                            </OfflineWithFeedback>
                        </View>
                    )}
                    {canChangeDefaultContactMethod && (
                        <OfflineWithFeedback
                            errors={ErrorUtils.getLatestErrorField(loginData, 'defaultLogin')}
                            errorRowStyles={[styles.ml8, styles.mr5]}
                            onClose={() => User.clearContactMethodErrors(contactMethod, 'defaultLogin')}
                        >
                            <MenuItem
                                title={this.props.translate('contacts.setAsDefault')}
                                icon={Expensicons.Profile}
                                onPress={this.setAsDefault}
                            />
                        </OfflineWithFeedback>
                    )}
                    {isDefaultContactMethod ? (
                        <OfflineWithFeedback
                            pendingAction={lodashGet(loginData, 'pendingFields.defaultLogin', null)}
                            errors={ErrorUtils.getLatestErrorField(loginData, 'defaultLogin')}
                            errorRowStyles={[styles.ml8, styles.mr5]}
                            onClose={() => User.clearContactMethodErrors(contactMethod, 'defaultLogin')}
                        >
                            <Text style={[styles.ph5, styles.mv3]}>
                                {this.props.translate('contacts.yourDefaultContactMethod')}
                            </Text>
                        </OfflineWithFeedback>
                    ) : (
                        <>
                            <OfflineWithFeedback
                                pendingAction={lodashGet(loginData, 'pendingFields.deletedLogin', null)}
                                errors={ErrorUtils.getLatestErrorField(loginData, 'deletedLogin')}
                                errorRowStyles={[styles.mt6]}
                                onClose={() => User.clearContactMethodErrors(contactMethod, 'deletedLogin')}
                            >
                                <MenuItem
                                    title={this.props.translate('common.remove')}
                                    icon={Expensicons.Trashcan}
                                    iconFill={themeColors.danger}
                                    onPress={() => this.toggleDeleteModal(true)}
                                />
                            </OfflineWithFeedback>
                        </>
                    )}
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

ContactMethodDetailsPage.propTypes = propTypes;
ContactMethodDetailsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        myDomainSecurityGroups: {
            key: ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS,
        },
        securityGroups: {
            key: `${ONYXKEYS.COLLECTION.SECURITY_GROUP}`,
        },
    }),
)(ContactMethodDetailsPage);
