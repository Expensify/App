import React, {Component} from 'react';
import {View, ScrollView} from 'react-native';
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
import FullNameInputRow from '../components/FullNameInputRow';
import Button from '../components/Button';
import FixedFooter from '../components/FixedFooter';
import Icon from '../components/Icon';
import CONST from '../CONST';
import Growl from '../libs/Growl';
import * as Inbox from '../libs/actions/Inbox';
import personalDetailsPropType from './personalDetailsPropType';
import TextInput from '../components/TextInput';
import Text from '../components/Text';
import Section from '../components/Section';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import * as Illustrations from '../components/Icon/Illustrations';
import * as Expensicons from '../components/Icon/Expensicons';
import * as LoginUtils from '../libs/LoginUtils';
import * as ValidationUtils from '../libs/ValidationUtils';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import * as User from '../libs/actions/User';
import FormElement from '../components/FormElement';
import {withNetwork} from '../components/OnyxProvider';
import networkPropTypes from '../components/networkPropTypes';

const propTypes = {
    ...withLocalizePropTypes,

    /** The personal details of the person who is logged in */
    myPersonalDetails: personalDetailsPropType.isRequired,

    /** Login list for the user that is signed in */
    loginList: PropTypes.arrayOf(PropTypes.shape({

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,
    })),

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
        loading: PropTypes.bool,
    }),

    /** The number of minutes the user has to wait for an inbox call */
    inboxCallUserWaitTime: PropTypes.number,

    /** The policyID of the last workspace whose settings the user accessed */
    lastAccessedWorkspacePolicyID: PropTypes.string,

    // The NVP describing a user's block status
    blockedFromConcierge: PropTypes.shape({
        // The date that the user will be unblocked
        expiresAt: PropTypes.string,
    }),

    /** Information about the network from Onyx */
    network: networkPropTypes.isRequired,
};

const defaultProps = {
    requestCallForm: {
        loading: false,
    },
    inboxCallUserWaitTime: null,
    lastAccessedWorkspacePolicyID: '',
    blockedFromConcierge: {},
    loginList: [],
};

class RequestCallPage extends Component {
    constructor(props) {
        super(props);
        const {firstName, lastName} = PersonalDetails.extractFirstAndLastNameFromAvailableDetails(props.myPersonalDetails);
        this.state = {
            firstName,
            hasFirstNameError: false,
            lastName,
            phoneNumber: this.getPhoneNumber(props.loginList) || '',
            phoneExtension: '',
            phoneExtensionError: '',
            hasLastNameError: false,
            phoneNumberError: '',
            onTheWeekend: false,
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.getPhoneNumber = this.getPhoneNumber.bind(this);
        this.getPhoneNumberError = this.getPhoneNumberError.bind(this);
        this.getPhoneExtensionError = this.getPhoneExtensionError.bind(this);
        this.validateInputs = this.validateInputs.bind(this);
        this.validatePhoneInput = this.validatePhoneInput.bind(this);
        this.validatePhoneExtensionInput = this.validatePhoneExtensionInput.bind(this);
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

    fetchData() {
        // If it is the weekend don't check the wait time
        if (moment().day() === 0 || moment().day() === 6) {
            this.setState({
                onTheWeekend: true,
            });
            return;
        }

        Inbox.getInboxCallWaitTime();
    }

    onSubmit() {
        if (!this.validateInputs()) {
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

        Inbox.requestInboxCall({
            taskID: this.props.route.params.taskID,
            policyID: policyForCall.id,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            phoneNumber: LoginUtils.getPhoneNumberWithoutSpecialChars(this.state.phoneNumber),
            phoneNumberExtension: this.state.phoneExtension,
        });
    }

    /**
     * Gets the user's phone number from their secondary login.
     * Returns null if it doesn't exist.
     * @param {Array<Object>} loginList
     *
     * @returns {String|null}
     */
    getPhoneNumber(loginList) {
        const secondaryLogin = _.find(loginList, login => Str.isSMSLogin(login.partnerUserID));
        return secondaryLogin ? Str.removeSMSDomain(secondaryLogin.partnerUserID) : null;
    }

    /**
     * Gets proper phone number error message depending on phoneNumber input value.
     * @returns {String}
     */
    getPhoneNumberError() {
        const phoneNumber = LoginUtils.getPhoneNumberWithoutSpecialChars(this.state.phoneNumber);
        if (_.isEmpty(this.state.phoneNumber.trim()) || !Str.isValidPhone(phoneNumber)) {
            return this.props.translate('messages.errorMessageInvalidPhone');
        }
        return '';
    }

    /**
     * Gets the phone extension error message depending on the phoneExtension input value.
     * @returns {String}
     */
    getPhoneExtensionError() {
        if (_.isEmpty(this.state.phoneExtension)) {
            return '';
        }
        if (!ValidationUtils.isPositiveInteger(this.state.phoneExtension)) {
            return this.props.translate('requestCallPage.error.phoneExtension');
        }
        return '';
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
        if (!this.state.onTheWeekend) {
            waitTimeKey = this.getWaitTimeMessageKey(this.props.inboxCallUserWaitTime);
        }
        return `${this.props.translate(waitTimeKey, {minutes: this.props.inboxCallUserWaitTime})} ${this.props.translate('requestCallPage.waitTime.guides')}`;
    }

    validatePhoneInput() {
        this.setState({phoneNumberError: this.getPhoneNumberError()});
    }

    validatePhoneExtensionInput() {
        this.setState({phoneExtensionError: this.getPhoneExtensionError()});
    }

    /**
     * Checks for input errors, returns true if everything is valid, false otherwise.
     * @returns {Boolean}
     */
    validateInputs() {
        const firstOrLastNameEmpty = _.isEmpty(this.state.firstName.trim()) || _.isEmpty(this.state.lastName.trim());
        if (firstOrLastNameEmpty) {
            Growl.error(this.props.translate('requestCallPage.growlMessageEmptyName'));
        }

        const phoneNumberError = this.getPhoneNumberError();
        const phoneExtensionError = this.getPhoneExtensionError();

        const [hasFirstNameError, hasLastNameError] = ValidationUtils.doesFailCharacterLimit(50, [this.state.firstName, this.state.lastName]);
        this.setState({
            hasFirstNameError,
            hasLastNameError,
            phoneNumberError,
            phoneExtensionError,
        });
        return !firstOrLastNameEmpty && _.isEmpty(phoneNumberError) && _.isEmpty(phoneExtensionError) && !hasFirstNameError && !hasLastNameError;
    }

    render() {
        const isBlockedFromConcierge = User.isBlockedFromConcierge(this.props.blockedFromConcierge);

        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('requestCallPage.title')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.goBack()}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView style={styles.flex1}>
                        <FormElement>
                            <Section
                                title={this.props.translate('requestCallPage.subtitle')}
                                icon={Illustrations.ConciergeExclamation}
                            >
                                <Text style={styles.mb4}>
                                    {this.props.translate('requestCallPage.description')}
                                </Text>
                                <FullNameInputRow
                                    firstName={this.state.firstName}
                                    firstNameError={PersonalDetails.getMaxCharacterError(this.state.hasFirstNameError)}
                                    lastName={this.state.lastName}
                                    lastNameError={PersonalDetails.getMaxCharacterError(this.state.hasLastNameError)}
                                    onChangeFirstName={firstName => this.setState({firstName})}
                                    onChangeLastName={lastName => this.setState({lastName})}
                                    style={[styles.mv4]}
                                />
                                <TextInput
                                    label={this.props.translate('common.phoneNumber')}
                                    name="phone"
                                    autoCorrect={false}
                                    value={this.state.phoneNumber}
                                    placeholder="2109400803"
                                    errorText={this.state.phoneNumberError}
                                    onBlur={this.validatePhoneInput}
                                    onChangeText={phoneNumber => this.setState({phoneNumber})}
                                />
                                <TextInput
                                    label={this.props.translate('requestCallPage.extension')}
                                    autoCompleteType="off"
                                    autoCorrect={false}
                                    value={this.state.phoneExtension}
                                    placeholder="100"
                                    errorText={this.state.phoneExtensionError}
                                    onBlur={this.validatePhoneExtensionInput}
                                    onChangeText={phoneExtension => this.setState({phoneExtension})}
                                    containerStyles={[styles.mt4]}
                                />
                                <Text style={[styles.textMicroSupporting, styles.mt4]}>{this.getWaitTimeMessage()}</Text>
                            </Section>
                        </FormElement>
                    </ScrollView>
                    <FixedFooter>
                        {isBlockedFromConcierge && (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                                <Icon src={Expensicons.Exclamation} fill={colors.yellow} />
                                <Text style={[styles.mutedTextLabel, styles.ml2, styles.flex1]}>{this.props.translate('requestCallPage.blockedFromConcierge')}</Text>
                            </View>
                        )}
                        <Button
                            success
                            pressOnEnter
                            onPress={this.onSubmit}
                            style={[styles.w100]}
                            text={this.props.translate('requestCallPage.callMe')}
                            isLoading={this.props.requestCallForm.loading}
                            isDisabled={isBlockedFromConcierge}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

RequestCallPage.propTypes = propTypes;
RequestCallPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        requestCallForm: {
            key: ONYXKEYS.REQUEST_CALL_FORM,
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
