import React from 'react';
import PropTypes from 'prop-types';
import {View, TouchableOpacity} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ExpensifyText from '../components/ExpensifyText';
import ExpensiTextInput from '../components/ExpensiTextInput';
import ExpensifyButton from '../components/Button';
import styles from '../styles/styles';
import AvatarWithImagePicker from '../components/AvatarWithImagePicker';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import * as User from '../libs/actions/User';
import currentUserPersonalDetailsPropsTypes from './settings/Profile/currentUserPersonalDetailsPropsTypes';
import compose from '../libs/compose';
import LoginUtil from '../libs/LoginUtil';
import * as Expensicons from '../components/Icon/Expensicons';
import Icon from '../components/Icon';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';


const propTypes = {

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape(currentUserPersonalDetailsPropsTypes),

    /** Password required for the secondary login form */
    password: PropTypes.string.isRequired,

    /** Skip Welcome form */
    skipWelcomeForm: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    myPersonalDetails: {},
};


class WelcomeForm extends React.Component {
    constructor(props) {
        super(props);

        const {
            firstName,
            lastName,
        } = props.myPersonalDetails;

        this.state = {
            firstName,
            lastName,
            login: '',
            errors: {
                firstName: '',
                lastName: '',
                login: '',
            },
        };

        this.submit = this.submit.bind(this);
        this.validate = this.validate.bind(this);
    }

    validate() {
        const {firstNameError, lastNameError} = PersonalDetails.getFirstAndLastNameErrors(this.state.firstName, this.state.lastName);

        const login = this.formType === CONST.LOGIN_TYPE.PHONE
            ? LoginUtil.getPhoneNumberWithoutSpecialChars(this.state.login)
            : this.state.login;

        const validationMethod = this.formType === CONST.LOGIN_TYPE.PHONE ? Str.isValidPhone : Str.isValidEmail;

        const errors = this.state.errors;
        errors.firstName = firstNameError;
        errors.lastName = lastNameError;
        errors.login = !this.state.password || !validationMethod(login);

        return _.every(errors, error => !error);
    }

    submit() {
        if (!this.validate()) {
            return;
        }

        PersonalDetails.setPersonalDetails({
            firstName: this.state.firstName.trim(),
            lastName: this.state.lastName.trim(),
        }, true, true);

        const login = this.formType === CONST.LOGIN_TYPE.PHONE
            ? LoginUtil.getPhoneNumberWithoutSpecialChars(this.state.login)
            : this.state.login;
        User.setSecondaryLoginAndNavigate(login, this.props.password);
    }

    render() {
        return (

            <>
                <View style={[styles.m5]}>
                    <AvatarWithImagePicker
                        isUploading={this.props.myPersonalDetails.avatarUploading}
                        avatarURL={this.props.myPersonalDetails.avatar}
                        onImageSelected={PersonalDetails.setAvatar}
                        onImageRemoved={() => PersonalDetails.deleteAvatar(this.props.myPersonalDetails.login)}
                        isUsingDefaultAvatar={this.props.myPersonalDetails.avatar && this.props.myPersonalDetails.avatar.includes('/images/avatars/avatar')}
                        anchorPosition={styles.createMenuPositionProfile}
                        size={CONST.AVATAR_SIZE.LARGE}
                        DefaultAvatar={() => (
                            <Icon
                                src={Expensicons.Workspace}
                                height={80}
                                width={80}
                            />
                        )}
                    />
                </View>

                <View style={[styles.mb5]}>
                    <ExpensiTextInput
                        label={this.props.translate('common.firstName')}
                        value={this.state.firstName}
                        onChangeText={firstName => this.setState({firstName})}
                        hasError={Boolean(this.state.errors.firstName)}
                        errorText={this.state.errors.firstName}
                    />
                </View>
                <View style={[styles.mb5]}>
                    <ExpensiTextInput
                        label={this.props.translate('common.lastName')}
                        value={this.state.lastName}
                        onChangeText={lastName => this.setState({lastName})}
                        hasError={Boolean(this.state.errors.lastName)}
                        errorText={this.state.errors.lastName}
                    />
                </View>
                <View style={styles.mb6}>
                    <ExpensiTextInput
                        label={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                            ? 'common.phoneNumber'
                            : 'profilePage.emailAddress')}
                        ref={el => this.phoneNumberInputRef = el}
                        value={this.state.login}
                        onChangeText={this.onSecondaryLoginChange}
                        keyboardType={this.formType === CONST.LOGIN_TYPE.PHONE
                            ? CONST.KEYBOARD_TYPE.PHONE_PAD : undefined}
                        returnKeyType="done"
                    />
                </View>
                <View style={[styles.mb4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    <TouchableOpacity onPress={() => this.props.skipWelcomeForm()}>
                        <ExpensifyText>
                            {this.props.translate('welcomeScreen.skip')}
                        </ExpensifyText>
                    </TouchableOpacity>
                    <ExpensifyButton
                        success
                        text={this.props.translate('welcomeScreen.getStarted')}
                        onPress={this.submit}
                    />
                </View>
            </>

        );
    }
}

WelcomeForm.propTypes = propTypes;
WelcomeForm.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
    }),
)(WelcomeForm);
