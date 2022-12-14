import React, {Component} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import moment from 'moment';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import colors from '../styles/colors';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import compose from '../libs/compose';
import Icon from '../components/Icon';
import CONST from '../CONST';
import * as Inbox from '../libs/actions/Inbox';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../components/withCurrentUserPersonalDetails';
import TextInput from '../components/TextInput';
import Text from '../components/Text';
import Section from '../components/Section';
import * as Illustrations from '../components/Icon/Illustrations';
import * as Expensicons from '../components/Icon/Expensicons';
import * as LoginUtils from '../libs/LoginUtils';
import * as ValidationUtils from '../libs/ValidationUtils';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import * as User from '../libs/actions/User';
import {withNetwork} from '../components/OnyxProvider';
import networkPropTypes from '../components/networkPropTypes';
import RequestCallConfirmationScreen from './RequestCallConfirmationScreen';
import Form from '../components/Form';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** Phone/Emails associated with user */
        partnerUserID: PropTypes.string,
    }),

    /** The policies which the user has access to */
    policies: PropTypes.shape({
        /** ID of the policy */
        policyID: PropTypes.string,

        /** The type of the policy */
        type: PropTypes.string,
    }).isRequired,

    /** Route object from navigation */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** The task ID to request the call for */
            taskID: PropTypes.string,
        }),
    }).isRequired,

    /** Used to track state for the request call form */
    requestCallForm: PropTypes.shape({
        isLoading: PropTypes.bool,

        /** Error message to display from Server */
        error: PropTypes.string,

        /** If true, we will show a confirmation screen to the user */
        didRequestCallSucceed: PropTypes.bool,
    }),

    /** The number of minutes the user has to wait for an inbox call */
    inboxCallUserWaitTime: PropTypes.number,

    /** The policyID of the last workspace whose settings the user accessed */
    lastAccessedWorkspacePolicyID: PropTypes.string,

    /** The NVP describing a user's block status */
    blockedFromConcierge: PropTypes.shape({
        /** The date that the user will be unblocked */
        expiresAt: PropTypes.string,
    }),

    /** Information about the network from Onyx */
    network: networkPropTypes.isRequired,
};

const defaultProps = {
    requestCallForm: {
        isLoading: false,
    },
    inboxCallUserWaitTime: null,
    lastAccessedWorkspacePolicyID: '',
    blockedFromConcierge: {},
    loginList: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class RequestCallPage extends Component {
    constructor(props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
        this.getPhoneNumber = this.getPhoneNumber.bind(this);
        this.validate = this.validate.bind(this);

        Inbox.clearDidRequestCallSucceed();
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.network.isOffline || this.props.network.isOffline) {
            return;
        }

        this.fetchData();
    }

    componentWillUnmount() {
        Inbox.clearDidRequestCallSucceed();
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    onSubmit(values) {
        if (User.isBlockedFromConcierge(this.props.blockedFromConcierge)) {
            return;
        }

        const policyForCall = _.find(this.props.policies, (policy) => {
            if (!policy) {
                return;
            }

            if (this.props.lastAccessedWorkspacePolicyID) {
                return policy.id === this.props.lastAccessedWorkspacePolicyID;
            }

            return policy.type === CONST.POLICY.TYPE.PERSONAL;
        });

        Inbox.requestCall({
            taskID: this.props.route.params.taskID,
            policyID: policyForCall.id,
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: LoginUtils.getPhoneNumberWithoutSpecialChars(values.phoneNumber),
            phoneNumberExtension: values.phoneNumberExtension,
        });
    }

    /**
     * Gets the user's phone number from their secondary logins.
     * Returns empty string if it doesn't exist.
     *
     * @returns {String}
     */
    getPhoneNumber() {
        const secondaryLogin = _.find(_.values(this.props.loginList), login => Str.isSMSLogin(login.partnerUserID));
        return secondaryLogin ? Str.removeSMSDomain(secondaryLogin.partnerUserID) : '';
    }

    getWaitTimeMessageKey(minutes) {
        if (minutes == null) {
            return 'requestCallPage.waitTime.calculating';
        }

        if (minutes > 300) {
            // The wait time is longer than 5 hours, so just say that.
            return 'requestCallPage.waitTime.fiveHoursPlus';
        }

        if (minutes > 60) {
            // The wait time is between 1 and 5 hours, so lets convert to hours and minutes.
            return 'requestCallPage.waitTime.hoursAndMinutes';
        }

        // The wait time is less than an hour so just give minutes.
        return 'requestCallPage.waitTime.minutes';
    }

    getWaitTimeMessage() {
        let waitTimeKey = 'requestCallPage.waitTime.weekend';
        if (!this.isWeekend()) {
            waitTimeKey = this.getWaitTimeMessageKey(this.props.inboxCallUserWaitTime);
        }
        return `${this.props.translate(waitTimeKey, {minutes: this.props.inboxCallUserWaitTime})} ${this.props.translate('requestCallPage.waitTime.guides')}`;
    }

    isWeekend() {
        return moment().day() === 0 || moment().day() === 6;
    }

    fetchData() {
        // If it is the weekend don't check the wait time
        if (this.isWeekend()) {
            return;
        }

        Inbox.openRequestCallPage();
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    validate(values) {
        const errors = {};

        if (_.isEmpty(values.firstName.trim())) {
            errors.firstName = this.props.translate('requestCallPage.error.firstName');
        }

        if (_.isEmpty(values.lastName.trim())) {
            errors.lastName = this.props.translate('requestCallPage.error.lastName');
        }

        const [firstNameLengthError, lastNameLengthError] = ValidationUtils.doesFailCharacterLimit(50, [values.firstName, values.lastName]);

        if (firstNameLengthError) {
            errors.firstName = this.props.translate('requestCallPage.error.firstNameLength');
        }

        if (lastNameLengthError) {
            errors.lastName = this.props.translate('requestCallPage.error.lastNameLength');
        }

        const phoneNumber = LoginUtils.getPhoneNumberWithoutSpecialChars(values.phoneNumber);
        if (_.isEmpty(values.phoneNumber.trim()) || !Str.isValidPhone(phoneNumber)) {
            errors.phoneNumber = this.props.translate('common.error.phoneNumber');
        }

        if (!_.isEmpty(values.phoneNumberExtension) && !ValidationUtils.isPositiveInteger(values.phoneNumberExtension)) {
            errors.phoneNumberExtension = this.props.translate('requestCallPage.error.phoneNumberExtension');
        }

        return errors;
    }

    render() {
        const {firstName, lastName} = PersonalDetails.extractFirstAndLastNameFromAvailableDetails(this.props.currentUserPersonalDetails);

        return (
            <ScreenWrapper includePaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('requestCallPage.title')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                {this.props.requestCallForm.didRequestCallSucceed
                    ? (
                        <RequestCallConfirmationScreen />
                    ) : (
                        <Form
                            formID={ONYXKEYS.FORMS.REQUEST_CALL_FORM}
                            validate={this.validate}
                            onSubmit={this.onSubmit}
                            submitButtonText={this.props.translate('requestCallPage.callMe')}
                            style={[styles.flexGrow1, styles.mh5]}
                            includeSafeAreaBottomPadding
                        >
                            <Section
                                title={this.props.translate('requestCallPage.subtitle')}
                                icon={Illustrations.ConciergeBubble}
                                containerStyles={[styles.callRequestSection]}
                            >
                                <Text style={[styles.mv3]}>
                                    {this.props.translate('requestCallPage.description')}
                                </Text>
                            </Section>
                            <TextInput
                                inputID="firstName"
                                defaultValue={firstName}
                                label={this.props.translate('common.firstName')}
                                name="fname"
                                placeholder={this.props.translate('profilePage.john')}
                                containerStyles={[styles.mt4]}
                            />
                            <TextInput
                                inputID="lastName"
                                defaultValue={lastName}
                                label={this.props.translate('common.lastName')}
                                name="lname"
                                placeholder={this.props.translate('profilePage.doe')}
                                containerStyles={[styles.mt4]}
                            />
                            <TextInput
                                inputID="phoneNumber"
                                defaultValue={this.getPhoneNumber()}
                                label={this.props.translate('common.phoneNumber')}
                                name="phone"
                                keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                                autoCorrect={false}
                                placeholder="2109400803"
                                containerStyles={[styles.mt4]}
                            />
                            <TextInput
                                inputID="phoneNumberExtension"
                                label={this.props.translate('requestCallPage.phoneNumberExtension')}
                                keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                                autoCompleteType="off"
                                autoCorrect={false}
                                placeholder="100"
                                containerStyles={[styles.mt4]}
                            />
                            {User.isBlockedFromConcierge(this.props.blockedFromConcierge) ? (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt4]}>
                                    <Icon src={Expensicons.Exclamation} fill={colors.yellow} />
                                    <Text style={[styles.mutedTextLabel, styles.ml2, styles.flex1]}>{this.props.translate('requestCallPage.blockedFromConcierge')}</Text>
                                </View>
                            )
                                : <Text style={[styles.textMicroSupporting, styles.mt4]}>{this.getWaitTimeMessage()}</Text>}
                        </Form>
                    )}
            </ScreenWrapper>
        );
    }
}

RequestCallPage.propTypes = propTypes;
RequestCallPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withCurrentUserPersonalDetails,
    withOnyx({
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        requestCallForm: {
            key: ONYXKEYS.FORMS.REQUEST_CALL_FORM,
            initWithStoredValues: false,
        },
        inboxCallUserWaitTime: {
            key: ONYXKEYS.INBOX_CALL_USER_WAIT_TIME,
            initWithStoredValues: false,
        },
        lastAccessedWorkspacePolicyID: {
            key: ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID,
        },
        blockedFromConcierge: {
            key: ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE,
        },
    }),
)(RequestCallPage);
