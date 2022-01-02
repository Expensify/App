import React from 'react';
import PropTypes from 'prop-types';
import {View, TouchableOpacity} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Text from '../components/Text';
import ExpensiTextInput from '../components/ExpensiTextInput';
import ExpensifyButton from '../components/Button';
import styles from '../styles/styles';
import AvatarWithImagePicker from '../components/AvatarWithImagePicker';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
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

    /** Skip Welcome form */
    skipWelcomeForm: PropTypes.func.isRequired,

    /** Func form to send data */
    updateUserDetails: PropTypes.func.isRequired,

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
            avatarFile: '',
            avatarURL: '',
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

        const validationConfig = this.formType === CONST.LOGIN_TYPE.PHONE
            ? {
                method: Str.isValidPhone,
                errorKey: 'loginForm.error.invalidFormatEmailLogin',
            }
            : {
                method: Str.isValidEmail,
                errorKey: 'loginForm.error.invalidFormatPhoneLogin',
            };

        const errors = this.state.errors;
        errors.firstName = firstNameError;
        errors.lastName = lastNameError;
        const hasSecondaryLoginError = this.state.login.length > 0 && !validationConfig.method(login);
        errors.login = hasSecondaryLoginError ? validationConfig.errorKey : false;

        return _.every(errors, error => !error);
    }

    submit() {
        if (!this.validate()) {
            return;
        }

        const login = this.formType === CONST.LOGIN_TYPE.PHONE
            ? LoginUtil.getPhoneNumberWithoutSpecialChars(this.state.login)
            : this.state.login;

        this.props.updateUserDetails({
            firstName: this.state.firstName.trim(),
            lastName: this.state.lastName.trim(),
            secondaryLogin: login,
            avatarFile: this.state.avatarFile,
        });
    }

    render() {
        return (
            <>
                <View style={[styles.m4]}>
                    <AvatarWithImagePicker
                        isUploading={this.props.myPersonalDetails.avatarUploading}
                        avatarURL={this.state.avatarURL}
                        onImageSelected={file => this.setState({avatarFile: file, avatarURL: file.uri})}
                        onImageRemoved={() => this.setState({avatarFile: null, avatarURL: ''})}
                        isUsingDefaultAvatar={!this.state.avatarURL}
                        anchorPosition={{top: 400, left: 220}}
                        size={CONST.AVATAR_SIZE.DEFAULT}
                        DefaultAvatar={() => (
                            <Icon
                                src={Expensicons.Workspace}
                                height={80}
                                width={80}
                            />
                        )}
                    />
                </View>
                <View style={[styles.mb3]}>
                    <ExpensiTextInput
                        label={this.props.translate('common.firstName')}
                        value={this.state.firstName}
                        onChangeText={firstName => this.setState({firstName})}
                        hasError={Boolean(this.state.errors.firstName)}
                        errorText={this.state.errors.firstName}
                    />
                </View>
                <View style={[styles.mb3]}>
                    <ExpensiTextInput
                        label={this.props.translate('common.lastName')}
                        value={this.state.lastName}
                        onChangeText={lastName => this.setState({lastName})}
                        hasError={Boolean(this.state.errors.lastName)}
                        errorText={this.state.errors.lastName}
                    />
                </View>
                <View style={styles.mb3}>
                    <ExpensiTextInput
                        label={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                            ? 'common.phoneNumber'
                            : 'profilePage.emailAddress')}
                        ref={el => this.phoneNumberInputRef = el}
                        value={this.state.login}
                        onChangeText={login => this.setState({login})}
                        keyboardType={this.formType === CONST.LOGIN_TYPE.PHONE
                            ? CONST.KEYBOARD_TYPE.PHONE_PAD : undefined}
                        hasError={Boolean(this.state.errors.login)}
                        errorText={this.state.errors.login ? this.props.translate(this.state.errors.login) : ''}
                    />
                </View>
                <View style={[styles.mb3, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    <TouchableOpacity onPress={() => this.props.skipWelcomeForm()}>
                        <Text>
                            {this.props.translate('welcomeScreen.skip')}
                        </Text>
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
