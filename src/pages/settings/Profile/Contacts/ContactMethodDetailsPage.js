import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Keyboard, ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withTheme, {withThemePropTypes} from '@components/withTheme';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ValidateCodeForm from './ValidateCodeForm';

const propTypes = {
    /* Onyx Props */

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

    /** Indicated whether the report data is loading */
    isLoadingReportData: PropTypes.bool,

    ...withLocalizePropTypes,
    ...withThemeStylesPropTypes,
    ...withThemePropTypes,
};

const defaultProps = {
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
    isLoadingReportData: true,
};

class ContactMethodDetailsPage extends Component {
    constructor(props) {
        super(props);

        this.deleteContactMethod = this.deleteContactMethod.bind(this);
        this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
        this.confirmDeleteAndHideModal = this.confirmDeleteAndHideModal.bind(this);
        this.getContactMethod = this.getContactMethod.bind(this);
        this.setAsDefault = this.setAsDefault.bind(this);

        this.state = {
            isDeleteModalOpen: false,
        };

        this.validateCodeFormRef = React.createRef();
    }

    componentDidMount() {
        const contactMethod = this.getContactMethod();
        const loginData = lodashGet(this.props.loginList, contactMethod, {});
        if (_.isEmpty(loginData)) {
            return;
        }
        User.resetContactMethodValidateCodeSentState(this.getContactMethod());
    }

    componentDidUpdate(prevProps) {
        const validatedDate = lodashGet(this.props.loginList, [this.getContactMethod(), 'validatedDate']);
        const prevValidatedDate = lodashGet(prevProps.loginList, [this.getContactMethod(), 'validatedDate']);

        // Navigate to methods page on successful magic code verification
        // validatedDate property is responsible to decide the status of the magic code verification
        if (!prevValidatedDate && validatedDate) {
            Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route);
        }
    }

    /**
     * Gets the current contact method from the route params
     * @returns {string}
     */
    getContactMethod() {
        const contactMethod = lodashGet(this.props.route, 'params.contactMethod');

        // We find the number of times the url is encoded based on the last % sign and remove them.
        const lastPercentIndex = contactMethod.lastIndexOf('%');
        const encodePercents = contactMethod.substring(lastPercentIndex).match(new RegExp('25', 'g'));
        let numberEncodePercents = encodePercents ? encodePercents.length : 0;
        const beforeAtSign = contactMethod.substring(0, lastPercentIndex).replace(CONST.REGEX.ENCODE_PERCENT_CHARACTER, (match) => {
            if (numberEncodePercents > 0) {
                numberEncodePercents--;
                return '%';
            }
            return match;
        });
        const afterAtSign = contactMethod.substring(lastPercentIndex).replace(CONST.REGEX.ENCODE_PERCENT_CHARACTER, '%');

        return decodeURIComponent(beforeAtSign + afterAtSign);
    }

    /**
     * Attempt to set this contact method as user's "Default contact method"
     */
    setAsDefault() {
        User.setContactMethodAsDefault(this.getContactMethod());
    }

    /**
     * Checks if the user is allowed to change their default contact method. This should only be allowed if:
     * 1. The viewed contact method is not already their default contact method
     * 2. The viewed contact method is validated
     * 3. If the user is on a private domain, their security group must allow primary login switching
     *
     * @returns {Boolean}
     */
    canChangeDefaultContactMethod() {
        const contactMethod = this.getContactMethod();
        const loginData = lodashGet(this.props.loginList, contactMethod, {});
        const isDefaultContactMethod = this.props.session.email === loginData.partnerUserID;

        // Cannot set this contact method as default if:
        // 1. This contact method is already their default
        // 2. This contact method is not validated
        if (isDefaultContactMethod || !loginData.validatedDate) {
            return false;
        }

        const domainName = Str.extractEmailDomain(this.props.session.email);
        const primaryDomainSecurityGroupID = lodashGet(this.props.myDomainSecurityGroups, domainName);

        // If there's no security group associated with the user for the primary domain,
        // default to allowing the user to change their default contact method.
        if (!primaryDomainSecurityGroupID) {
            return true;
        }

        // Allow user to change their default contact method if they don't have a security group OR if their security group
        // does NOT restrict primary login switching.
        return !lodashGet(this.props.securityGroups, [`${ONYXKEYS.COLLECTION.SECURITY_GROUP}${primaryDomainSecurityGroupID}`, 'hasRestrictedPrimaryLogin'], false);
    }

    /**
     * Deletes the contact method if it has errors. Otherwise, it shows the confirmation alert and deletes it only if the user confirms.
     */
    deleteContactMethod() {
        if (!_.isEmpty(lodashGet(this.props.loginList, [this.getContactMethod(), 'errorFields'], {}))) {
            User.deleteContactMethod(this.getContactMethod(), this.props.loginList);
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
        Keyboard.dismiss();
    }

    /**
     * Delete the contact method and hide the modal
     */
    confirmDeleteAndHideModal() {
        this.toggleDeleteModal(false);
        User.deleteContactMethod(this.getContactMethod(), this.props.loginList);
    }

    render() {
        const contactMethod = this.getContactMethod();

        // Replacing spaces with "hard spaces" to prevent breaking the number
        const formattedContactMethod = Str.isSMSLogin(contactMethod) ? this.props.formatPhoneNumber(contactMethod).replace(/ /g, '\u00A0') : contactMethod;

        if (this.props.isLoadingReportData && _.isEmpty(this.props.loginList)) {
            return <FullscreenLoadingIndicator />;
        }

        const loginData = this.props.loginList[contactMethod];
        if (!contactMethod || !loginData) {
            return (
                <ScreenWrapper testID={ContactMethodDetailsPage.displayName}>
                    <FullPageNotFoundView
                        shouldShow
                        linkKey="contacts.goBackContactMethods"
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route)}
                        onLinkPress={() => Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route)}
                    />
                </ScreenWrapper>
            );
        }

        const isDefaultContactMethod = this.props.session.email === loginData.partnerUserID;
        const hasMagicCodeBeenSent = lodashGet(this.props.loginList, [contactMethod, 'validateCodeSent'], false);
        const isFailedAddContactMethod = Boolean(lodashGet(loginData, 'errorFields.addedLogin'));
        const isFailedRemovedContactMethod = Boolean(lodashGet(loginData, 'errorFields.deletedLogin'));

        return (
            <ScreenWrapper
                onEntryTransitionEnd={() => this.validateCodeFormRef.current && this.validateCodeFormRef.current.focus()}
                testID={ContactMethodDetailsPage.displayName}
            >
                <HeaderWithBackButton
                    title={formattedContactMethod}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route)}
                />
                <ScrollView keyboardShouldPersistTaps="handled">
                    <ConfirmModal
                        title={this.props.translate('contacts.removeContactMethod')}
                        onConfirm={this.confirmDeleteAndHideModal}
                        onCancel={() => this.toggleDeleteModal(false)}
                        prompt={this.props.translate('contacts.removeAreYouSure')}
                        confirmText={this.props.translate('common.yesContinue')}
                        cancelText={this.props.translate('common.cancel')}
                        isVisible={this.state.isDeleteModalOpen && !isDefaultContactMethod}
                        danger
                    />

                    {isFailedAddContactMethod && (
                        <DotIndicatorMessage
                            style={[this.props.themeStyles.mh5, this.props.themeStyles.mv3]}
                            messages={ErrorUtils.getLatestErrorField(loginData, 'addedLogin')}
                            type="error"
                        />
                    )}

                    {!loginData.validatedDate && !isFailedAddContactMethod && (
                        <View style={[this.props.themeStyles.ph5, this.props.themeStyles.mt3, this.props.themeStyles.mb7]}>
                            <DotIndicatorMessage
                                type="success"
                                style={[this.props.themeStyles.mb3]}
                                messages={{0: ['contacts.enterMagicCode', {contactMethod: formattedContactMethod}]}}
                            />

                            <ValidateCodeForm
                                contactMethod={contactMethod}
                                hasMagicCodeBeenSent={hasMagicCodeBeenSent}
                                loginList={this.props.loginList}
                                ref={this.validateCodeFormRef}
                            />
                        </View>
                    )}
                    {this.canChangeDefaultContactMethod() ? (
                        <OfflineWithFeedback
                            errors={ErrorUtils.getLatestErrorField(loginData, 'defaultLogin')}
                            errorRowStyles={[this.props.themeStyles.ml8, this.props.themeStyles.mr5]}
                            onClose={() => User.clearContactMethodErrors(contactMethod, 'defaultLogin')}
                        >
                            <MenuItem
                                title={this.props.translate('contacts.setAsDefault')}
                                icon={Expensicons.Profile}
                                onPress={this.setAsDefault}
                            />
                        </OfflineWithFeedback>
                    ) : null}
                    {isDefaultContactMethod ? (
                        <OfflineWithFeedback
                            pendingAction={lodashGet(loginData, 'pendingFields.defaultLogin', null)}
                            errors={ErrorUtils.getLatestErrorField(loginData, isFailedRemovedContactMethod ? 'deletedLogin' : 'defaultLogin')}
                            errorRowStyles={[this.props.themeStyles.ml8, this.props.themeStyles.mr5]}
                            onClose={() => User.clearContactMethodErrors(contactMethod, isFailedRemovedContactMethod ? 'deletedLogin' : 'defaultLogin')}
                        >
                            <Text style={[this.props.themeStyles.ph5, this.props.themeStyles.mv3]}>{this.props.translate('contacts.yourDefaultContactMethod')}</Text>
                        </OfflineWithFeedback>
                    ) : (
                        <OfflineWithFeedback
                            pendingAction={lodashGet(loginData, 'pendingFields.deletedLogin', null)}
                            errors={ErrorUtils.getLatestErrorField(loginData, 'deletedLogin')}
                            errorRowStyles={[this.props.themeStyles.mt6, this.props.themeStyles.ph5]}
                            onClose={() => User.clearContactMethodErrors(contactMethod, 'deletedLogin')}
                        >
                            <MenuItem
                                title={this.props.translate('common.remove')}
                                icon={Expensicons.Trashcan}
                                iconFill={this.props.theme.danger}
                                onPress={() => this.toggleDeleteModal(true)}
                            />
                        </OfflineWithFeedback>
                    )}
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

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
        myDomainSecurityGroups: {
            key: ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS,
        },
        securityGroups: {
            key: `${ONYXKEYS.COLLECTION.SECURITY_GROUP}`,
        },
        isLoadingReportData: {
            key: `${ONYXKEYS.IS_LOADING_REPORT_DATA}`,
        },
    }),
    withThemeStyles,
    withTheme,
)(ContactMethodDetailsPage);
