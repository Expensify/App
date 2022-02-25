import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import Text from '../components/Text';
import TextInput from '../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import Button from '../components/Button';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import FixedFooter from '../components/FixedFooter';
import AvatarWithImagePicker from '../components/AvatarWithImagePicker';
import currentUserPersonalDetailsPropsTypes from '../pages/settings/Profile/currentUserPersonalDetailsPropsTypes.js';
import * as ValidationUtils from '../libs/ValidationUtils';
import * as LoginUtil from '../libs/LoginUtil';

import NameValuePair from '../libs/actions/NameValuePair';
import NameInput from '../components/FormInput/NameInput';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape(currentUserPersonalDetailsPropsTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    myPersonalDetails: {},
    user: {
        loginList: [],
    },
};

class ProfilePage extends Component {
    constructor(props) {
        super(props);
        
        this.updatePersonalDetails = this.updatePersonalDetails.bind(this);
        this.setFirstTimeStepToGlobalCreateMenu = this.setFirstTimeStepToGlobalCreateMenu.bind(this);
        this.validateInputs = this.validateInputs.bind(this);
        this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
        this.handleLastNameChange = this.handleLastNameChange.bind(this);
        this.isNameValid = this.isNameValid.bind(this);
        this.isFormValid = this.isFormValid.bind(this);

        this.firstName = '';
        this.lastName = '';
        this.secondaryLogin = '';
        this.password = '';

        this.password = LoginUtil.getAndDestroyPassword();
        this.formType = 
        this.formType = props.route.params.type;
    }

    setFirstTimeStepToGlobalCreateMenu() {
        NameValuePair.set(
            CONST.NVP.FIRST_TIME_NEW_EXPENSIFY_USER_STEP, 
            CONST.FIRST_TIME_NEW_EXPENSIFY_USER_STEP.GLOBAL_CREATE_MENU, 
            ONYXKEYS.NVP_FIRST_TIME_NEW_EXPENSIFY_USER_STEP,
        );
    }

    /**
     * Submit form to update personal details
     */
    updatePersonalDetails() {
        console.log('updaatePersonalDetaisl');
        console.log(this.validateInputs());
        //this.setFirstTimeStepToGlobalCreateMenu(); 
        Navigation.dismissModal(true);

        return;
        if (!this.validateInputs()) {
            return;
        }

        PersonalDetails.setPersonalDetails({
            firstName: this.firstName.getValue().trim(),
            lastName: this.lastName.getValue.trim(),
        }, true);
    }

    isNameValid(name) {
        return name && name.length <= 50;
    }

    handleLastNameChange(text) {
        this.lastName = text;
        this.isLastNameValid = this.isNameValid(text);
    }

    handleFirstNameChange(text) {
        this.firstName = text;
        this.isFirstNameValid = this.isNameValid(text);
    }

    handleSecondaryLoginChange(text) {
        this.secondaryLogin = text;
    }

    isFormValid() {
        return ( this.isNameValid(this.firstName) 
            && this.isNameValid(this.lastName) 
        )
    }

    validateInputs() {
        if ((this.firstName.current.getError() 
            + this.lastName.current.getError() 
            + this.phoneNumber.current.getError()
            ).length > 1 ) 
        {
            console.log('backing');
            return;
        }

        
        return true;
    }

    componentDidMount() {
    }

    closeModal() {
        //this.setFirstTimeStepToGlobalCreateMenu();
        Navigation.dismissModal(true)
    }

    render() {
        // Disables button if none of the form values have changed
        const isButtonDisabled = false;
        return (
            <ScreenWrapper
                onWillUnmount={this.setFirstTimeStepToGlobalCreateMenu}
            >
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={'Welcome'}
                        onCloseButtonPress={this.closeModal}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <Text style={[styles.mb8, styles.mtn4]}>
                            {('Welcome to Expensify! Tell us a little bit about yourself before getting started')}
                        </Text>
                        <AvatarWithImagePicker
                            containerStyles={[styles.mt6]}
                            isUploading={this.props.myPersonalDetails.avatarUploading}
                            avatarURL={this.props.myPersonalDetails.avatar}
                            onImageSelected={PersonalDetails.setAvatar}
                            onImageRemoved={() => PersonalDetails.deleteAvatar(this.props.myPersonalDetails.login)}
                            // eslint-disable-next-line max-len
                            isUsingDefaultAvatar={this.props.myPersonalDetails.avatar.includes('/images/avatars/avatar')}
                            anchorPosition={styles.createMenuPositionProfile}
                            size={CONST.AVATAR_SIZE.LARGE}
                        />
                        
                        <TextInput
                            label={'First Name'}
                            containerStyles={[styles.mt6]}
                            //errorText={this.errorMessage}
                            onChangeText={this.handleFirstNameChange}
                            placeholder={this.props.translate('profilePage.john')}
                        />

                        <TextInput
                            label={'Last Name'}
                            containerStyles={[styles.mt6]}
                            //errorText={this.errorMessage}
                            onChangeText={this.handleLastNameChange}
                            placeholder={this.props.translate('profilePage.john')}
                        />

                        <View style={styles.mb6}>
                            <TextInput
                                label={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                                    ? 'common.phoneNumber'
                                    : 'profilePage.emailAddress')}
                                //ref={el => this.phoneNumberInputRef = el}
                                //value={this.state.login}
                                onChangeText={this.onSecondaryLoginChange}
                                keyboardType={this.formType === CONST.LOGIN_TYPE.PHONE
                                    ? CONST.KEYBOARD_TYPE.PHONE_PAD : undefined}
                                returnKeyType="done"
                            />
                        </View>
                        <NameInput
                            label={'Phone Number'}
                            style={[styles.mt6]}
                            onChangeText={this.handl} 
                            placeholder={this.props.translate('profilePage.john')}
                        />
                        {!_.isEmpty(this.props.user.error) && (
                            <Text style={styles.formError}>
                                {this.props.user.error}
                            </Text>
                        )}
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            success
                            //isDisabled={this.validateForm()}
                            isLoading={this.props.user.loading}
                            text={this.props.translate('addSecondaryLoginPage.sendValidation')}
                            onPress={this.submitForm}
                            pressOnEnter
                        />
                        <Button
                            success
                            onPress={this.updatePersonalDetails}
                            style={[styles.w100]}
                            text={'Get Started'}
                            pressOnEnter
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

ProfilePage.propTypes = propTypes;
ProfilePage.defaultProps = defaultProps;
ProfilePage.displayName = 'ProfilePage';

export default compose(
    withLocalize,
    withOnyx({
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(ProfilePage);
