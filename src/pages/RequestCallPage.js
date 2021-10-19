import React, {Component} from 'react';
import {View, ScrollView} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import compose from '../libs/compose';
import FullNameInputRow from '../components/FullNameInputRow';
import Button from '../components/Button';
import FixedFooter from '../components/FixedFooter';
import CONST from '../CONST';
import Growl from '../libs/Growl';
import {requestInboxCall} from '../libs/actions/Inbox';
import {fetchOrCreateChatReport} from '../libs/actions/Report';
import personalDetailsPropType from './personalDetailsPropType';
import ExpensiTextInput from '../components/ExpensiTextInput';
import Text from '../components/Text';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import RequestCallIcon from '../../assets/images/request-call.svg';

const propTypes = {
    ...withLocalizePropTypes,

    /** The personal details of the person who is logged in */
    myPersonalDetails: personalDetailsPropType.isRequired,

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        loginList: PropTypes.arrayOf(PropTypes.shape({

            /** Phone/Email associated with user */
            partnerUserID: PropTypes.string,
        })),
    }).isRequired,

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
};

class RequestCallPage extends Component {
    constructor(props) {
        super(props);
        const {firstName, lastName} = this.getFirstAndLastName(props.myPersonalDetails);
        this.state = {
            firstName,
            lastName,
            phoneNumber: this.getPhoneNumber(props.user.loginList) ?? '',
            phoneNumberError: '',
            isLoading: false,
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.getPhoneNumber = this.getPhoneNumber.bind(this);
        this.getFirstAndLastName = this.getFirstAndLastName.bind(this);
        this.validatePhoneInput = this.validatePhoneInput.bind(this);
    }

    onSubmit() {
        const shouldNotSubmit = _.isEmpty(this.state.firstName.trim())
            || _.isEmpty(this.state.lastName.trim())
            || _.isEmpty(this.state.phoneNumber.trim())
            || !Str.isValidPhone(this.state.phoneNumber);

        if (_.isEmpty(this.state.firstName.trim()) || _.isEmpty(this.state.lastName.trim())) {
            Growl.error(this.props.translate('requestCallPage.growlMessageEmptyName'));
            return;
        }

        this.validatePhoneInput();

        if (shouldNotSubmit) {
            return;
        }
        const personalPolicy = _.find(this.props.policies, policy => policy && policy.type === CONST.POLICY.TYPE.PERSONAL);
        if (!personalPolicy) {
            Growl.error(this.props.translate('requestCallPage.growlMessageNoPersonalPolicy'), 3000);
            return;
        }
        this.setState({isLoading: true});
        requestInboxCall(this.props.route.params.taskID, personalPolicy.id, this.state.firstName, this.state.lastName, this.state.phoneNumber)
            .then((result) => {
                this.setState({isLoading: false});
                if (result.jsonCode === 200) {
                    Growl.success(this.props.translate('requestCallPage.growlMessageOnSave'));
                    fetchOrCreateChatReport([this.props.session.email, CONST.EMAIL.CONCIERGE], true);
                    return;
                }

                // Phone number validation is handled by the API
                Growl.error(result.message, 3000);
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
     * Gets the first and last name from the user's personal details.
     * If the login is the same as the displayName, then they don't exist,
     * so we return empty strings instead.
     * @param {String} login
     * @param {String} displayName
     *
     * @returns {Object}
     */
    getFirstAndLastName({login, displayName}) {
        let firstName;
        let lastName;

        if (Str.removeSMSDomain(login) === displayName) {
            firstName = '';
            lastName = '';
        } else {
            const firstSpaceIndex = displayName.indexOf(' ');
            const lastSpaceIndex = displayName.lastIndexOf(' ');

            if (firstSpaceIndex === -1) {
                firstName = displayName;
                lastName = '';
            } else {
                firstName = displayName.substring(0, firstSpaceIndex);
                lastName = displayName.substring(lastSpaceIndex);
            }
        }

        return {firstName, lastName};
    }

    validatePhoneInput() {
        if (_.isEmpty(this.state.phoneNumber.trim())) {
            this.setState({phoneNumberError: this.props.translate('messages.noPhoneNumber')});
        } else if (!Str.isValidPhone(this.state.phoneNumber)) {
            this.setState({phoneNumberError: this.props.translate('requestCallPage.errorMessageInvalidPhone')});
        } else {
            this.setState({phoneNumberError: ''});
        }
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('requestCallPage.title')}
                        shouldShowBackButton
                        onBackButtonPress={() => fetchOrCreateChatReport([
                            this.props.session.email,
                            CONST.EMAIL.CONCIERGE,
                        ], true)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={[styles.p5, styles.pt0]}>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text style={[styles.h1, styles.flex1]}>{this.props.translate('requestCallPage.subtitle')}</Text>
                            <RequestCallIcon width={160} height={100} style={styles.flex1} />
                        </View>
                        <Text style={[styles.mb4]}>
                            {this.props.translate('requestCallPage.description')}
                        </Text>
                        <FullNameInputRow
                            firstName={this.state.firstName}
                            lastName={this.state.lastName}
                            onChangeFirstName={firstName => this.setState({firstName})}
                            onChangeLastName={lastName => this.setState({lastName})}
                            style={[styles.mv4]}
                        />
                        <View style={styles.mt4}>
                            <ExpensiTextInput
                                label={this.props.translate('common.phoneNumber')}
                                autoCompleteType="off"
                                autoCorrect={false}
                                value={this.state.phoneNumber}
                                placeholder="+14158675309"
                                errorText={this.state.phoneNumberError}
                                onBlur={this.validatePhoneInput}
                                onChangeText={phoneNumber => this.setState({phoneNumber})}
                            />
                        </View>
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            success
                            onPress={this.onSubmit}
                            style={[styles.w100]}
                            text={this.props.translate('requestCallPage.callMe')}
                            isLoading={this.state.isLoading}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

RequestCallPage.displayName = 'RequestCallPage';
RequestCallPage.propTypes = propTypes;
export default compose(
    withLocalize,
    withOnyx({
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        user: {
            key: ONYXKEYS.USER,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(RequestCallPage);
