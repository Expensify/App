import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
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
import TextInput from '../../../../components/TextInput';
import CONST from '../../../../CONST';
import Icon from '../../../../components/Icon';
import colors from '../../../../styles/colors';

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

class ContactMethodDetailsPage extends Component {
    constructor(props) {
        super(props);

        this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
        this.confirmDeleteAndHideModal = this.confirmDeleteAndHideModal.bind(this);
        this.resendValidateCode = this.resendValidateCode.bind(this);
        this.getContactMethod = this.getContactMethod.bind(this);

        this.state = {
            isDeleteModalOpen: false,
            validateCode: '',
        };
    }

    /**
     * Toggle delete confirm modal visibility
     * @param {Boolean} shouldOpen
     */
    toggleDeleteModal(shouldOpen) {
        this.setState({isDeleteModalOpen: shouldOpen});
    }

    getContactMethod() {
        return decodeURIComponent(lodashGet(this.props.route, 'params.contactMethod'));
    }

    /**
     * Delete the contact method and hide the modal
     */
    confirmDeleteAndHideModal() {
        const contactMethod = this.getContactMethod();
        User.deleteContactMethod(contactMethod)
        this.toggleDeleteModal(false);
        Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS);
    }

    /**
     * Request a validate code / magic code be sent to verify this contact method
     */
    resendValidateCode() {
        User.requestContactMethodValidateCode(this.getContactMethod());
    }

    render() {
        const contactMethod = this.getContactMethod();
        const loginData = this.props.loginList[contactMethod];
        if (!contactMethod || !loginData) {
            Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS);
            return null;
        }

        const isDefaultContactMethod = (this.props.session.email === loginData.partnerUserID);

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
                        title={this.props.translate('contacts.removeContactMethod')}
                        onConfirm={this.confirmDeleteAndHideModal}
                        onCancel={() => this.toggleDeleteModal(false)}
                        prompt={this.props.translate('contacts.removeAreYouSure')}
                        confirmText={this.props.translate('common.yesContinue')}
                        isVisible={this.state.isDeleteModalOpen}
                        danger
                    />
                    {!loginData.validatedDate && (
                        <>
                            {/* <MenuItem
                                title="Resend verification"
                                icon={Expensicons.Mail}
                                iconRight={Expensicons.Checkmark}
                                onPress={() => console.log('hi')}
                                shouldShowRightIcon
                                success
                            /> */}
                            {/* <DotIndicatorMessage style={[styles.ph8, styles.mt2]} messages={{0: this.props.translate('contacts.enterMagicCode', {contactMethod})}} type="success" /> */}
                            

                            <View style={[styles.mh8, styles.mb2]}>
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb1, styles.mt3]}>
                                    <Icon src={Expensicons.DotIndicator} fill={colors.green} />
                                    <View style={[styles.flex1, styles.ml2]}>
                                        <Text style={[styles.mb0]}>
                                            {this.props.translate('contacts.enterMagicCode', {contactMethod})}
                                        </Text>
                                    </View>
                                </View>
                                <TextInput
                                    label={this.props.translate('common.magicCode')}
                                    name="validateCode"
                                    value={this.state.validateCode}
                                    onChangeText={text => this.setState({validateCode: text})}
                                    // onSubmitEditing={this.validateAndSubmitForm}
                                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                    errorText=""
                                    blurOnSubmit={false}
                                />
                                <TouchableOpacity
                                    style={[styles.mt2]}
                                    onPress={this.resendValidateCode}
                                    // underlayColor={themeColors.componentBG}
                                >
                                    <Text style={[styles.link]}>
                                        {this.props.translate('contacts.resendMagicCode')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                    <OfflineWithFeedback
                        pendingAction={lodashGet(loginData, 'pendingFields.deletedLogin', null)}
                        errors={lodashGet(loginData, 'errorFields.deletedLogin', null)}
                        errorRowStyles={[styles.mt6]}
                        onClose={() => User.clearContactMethodErrors(contactMethod, 'deletedLogin')}
                    >
                        <MenuItem
                            title={this.props.translate('common.remove')}
                            icon={Expensicons.Trashcan}
                            onPress={() => this.toggleDeleteModal(true)}
                            disabled={isDefaultContactMethod}
                        />
                    </OfflineWithFeedback>
                    {isDefaultContactMethod && (
                        <Text style={[styles.ph8]}>
                            {this.props.translate('contacts.yourDefaultContactMethod')}
                        </Text>
                    )}
                </ScrollView>
            </ScreenWrapper>
        );
    }
};

ContactMethodDetailsPage.propTypes = propTypes;
ContactMethodDetailsPage.defaultProps = defaultProps;

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
