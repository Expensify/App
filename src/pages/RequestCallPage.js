import React, {Component} from 'react';
import {View, Text, TextInput} from 'react-native';
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
import {requestConciergeDMCall} from '../libs/actions/Inbox';
import {fetchOrCreateChatReport} from '../libs/actions/Report';
import personalDetailsPropType from './personalDetailsPropType';

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
};

class RequestCallPage extends Component {
    constructor(props) {
        super(props);
        const {firstName, lastName} = this.getFirstAndLastName(props.myPersonalDetails);
        this.state = {
            firstName,
            lastName,
            phoneNumber: this.getPhoneNumber(props.user.loginList) ?? '',
            isLoading: false,
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.getPhoneNumber = this.getPhoneNumber.bind(this);
        this.getFirstAndLastName = this.getFirstAndLastName.bind(this);
    }

    onSubmit() {
        this.setState({isLoading: true});
        if (!this.state.firstName.length || !this.state.lastName.length) {
            Growl.success(this.props.translate('requestCallPage.growlMessageEmptyName'));
            this.setState({isLoading: false});
            return;
        }

        const personalPolicy = _.find(this.props.policies, policy => policy.type === CONST.POLICY.TYPE.PERSONAL);
        if (!personalPolicy) {
            Growl.error(this.props.translate('requestCallPage.growlMessageNoPersonalPolicy'), 3000);
            return;
        }
        requestConciergeDMCall(personalPolicy.id, this.state.firstName, this.state.lastName, this.state.phoneNumber)
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

        if (login === displayName) {
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

    render() {
        const isButtonDisabled = false;
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('requestCallPage.requestACall')}
                    shouldShowBackButton
                    onBackButtonPress={() => fetchOrCreateChatReport([
                        this.props.session.email,
                        CONST.EMAIL.CONCIERGE,
                    ], true)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.flex1, styles.p5]}>
                    <Text style={[styles.mb4, styles.textP]}>
                        {this.props.translate('requestCallPage.description')}
                    </Text>
                    <Text style={[styles.mt4, styles.mb4, styles.textP]}>
                        {this.props.translate('requestCallPage.instructions')}
                    </Text>
                    <FullNameInputRow
                        firstName={this.state.firstName}
                        lastName={this.state.lastName}
                        onChangeFirstName={firstName => this.setState({firstName})}
                        onChangeLastName={lastName => this.setState({lastName})}
                        style={[styles.mt4, styles.mb4]}
                    />
                    <Text style={[styles.mt4, styles.formLabel]} numberOfLines={1}>
                        {this.props.translate('common.phoneNumber')}
                    </Text>
                    <TextInput
                        autoCompleteType="off"
                        autoCorrect={false}
                        style={[styles.textInput]}
                        value={this.state.phoneNumber}
                        placeholder="+14158675309"
                        onChangeText={phoneNumber => this.setState({phoneNumber})}
                    />
                    <Text style={[styles.mt4, styles.textLabel, styles.colorMuted, styles.mb6]}>
                        {this.props.translate('requestCallPage.availabilityText')}
                    </Text>
                </View>
                <FixedFooter>
                    <Button
                        success
                        isDisabled={isButtonDisabled}
                        onPress={this.onSubmit}
                        style={[styles.w100]}
                        text={this.props.translate('requestCallPage.callMe')}
                        isLoading={this.state.isLoading}
                    />
                </FixedFooter>
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
