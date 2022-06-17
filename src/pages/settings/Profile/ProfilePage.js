import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Str from 'expensify-common/lib/str';
import moment from 'moment-timezone';
import _ from 'underscore';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../components/ScreenWrapper';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import LoginField from './LoginField';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import TextInput from '../../../components/TextInput';
import Picker from '../../../components/Picker';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import AvatarWithImagePicker from '../../../components/AvatarWithImagePicker';
import currentUserPersonalDetailsPropsTypes from './currentUserPersonalDetailsPropsTypes';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import * as ReportUtils from '../../../libs/ReportUtils';
import Form from '../../../components/Form';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape(currentUserPersonalDetailsPropsTypes),

    /** Login list for the user that is signed in */
    loginList: PropTypes.arrayOf(PropTypes.shape({

        /** Value of partner name */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** Date of when login was validated */
        validatedDate: PropTypes.string,
    })),
    ...withLocalizePropTypes,
};

const defaultProps = {
    myPersonalDetails: {},
    loginList: [],
};

const timezones = _.chain(moment.tz.names())
    .filter(timezone => !timezone.startsWith('Etc/GMT'))
    .map(timezone => ({
        value: timezone,
        label: timezone,
    }))
    .value();

class ProfilePage extends Component {
    constructor(props) {
        super(props);

        this.defaultAvatar = ReportUtils.getDefaultAvatar(this.props.myPersonalDetails.login);

        this.state = {
            firstName: props.myPersonalDetails.firstName,
            hasFirstNameError: false,
            lastName: props.myPersonalDetails.lastName,
            hasLastNameError: false,
            pronouns: props.myPersonalDetails.pronouns,
            hasPronounError: false,
            hasSelfSelectedPronouns: !_.isEmpty(props.myPersonalDetails.pronouns) && !props.myPersonalDetails.pronouns.startsWith(CONST.PRONOUNS.PREFIX),
            selectedTimezone: lodashGet(props.myPersonalDetails.timezone, 'selected', CONST.DEFAULT_TIME_ZONE.selected),
            isAutomaticTimezone: lodashGet(props.myPersonalDetails.timezone, 'automatic', CONST.DEFAULT_TIME_ZONE.automatic),
            logins: this.getLogins(props.loginList),
            avatar: {uri: lodashGet(this.props.myPersonalDetails, 'avatar', ReportUtils.getDefaultAvatar(this.props.myPersonalDetails.login))},
            isAvatarChanged: false,
        };

        this.getLogins = this.getLogins.bind(this);
        this.validate = this.validate.bind(this);
        this.setAutomaticTimezone = this.setAutomaticTimezone.bind(this);
        this.updatePersonalDetails = this.updatePersonalDetails.bind(this);
        this.updateAvatar = this.updateAvatar.bind(this);
    }

    componentDidUpdate(prevProps) {
        let stateToUpdate = {};

        // Recalculate logins if loginList has changed
        if (this.props.loginList !== prevProps.loginList) {
            stateToUpdate = {...stateToUpdate, logins: this.getLogins(this.props.loginList)};
        }

        if (_.isEmpty(stateToUpdate)) {
            return;
        }

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState(stateToUpdate);
    }

    /**
     * Set the form to use automatic timezone
     *
     * @param {Boolean} isAutomaticTimezone
     */
    setAutomaticTimezone(isAutomaticTimezone) {
        this.setState(({selectedTimezone}) => ({
            isAutomaticTimezone,
            selectedTimezone: isAutomaticTimezone ? moment.tz.guess() : selectedTimezone,
        }));
    }

    /**
     * Get the most validated login of each type
     *
     * @param {Array} loginList
     * @returns {Object}
     */
    getLogins(loginList) {
        return _.reduce(loginList, (logins, currentLogin) => {
            const type = Str.isSMSLogin(currentLogin.partnerUserID) ? CONST.LOGIN_TYPE.PHONE : CONST.LOGIN_TYPE.EMAIL;
            const login = Str.removeSMSDomain(currentLogin.partnerUserID);

            // If there's already a login type that's validated and/or currentLogin isn't valid then return early
            if ((login !== this.props.myPersonalDetails.login) && !_.isEmpty(logins[type])
                && (logins[type].validatedDate || !currentLogin.validatedDate)) {
                return logins;
            }
            return {
                ...logins,
                [type]: {
                    ...currentLogin,
                    type,
                    partnerUserID: Str.removeSMSDomain(currentLogin.partnerUserID),
                },
            };
        }, {
            phone: {},
            email: {},
        });
    }

    /**
     * Updates the user's avatar image.
     * @param {Object} avatar
     */
    updateAvatar(avatar) {
        this.setState({avatar: _.isUndefined(avatar) ? {uri: ReportUtils.getDefaultAvatar(this.props.myPersonalDetails.login)} : avatar, isAvatarChanged: true});
    }

    /**
     * Submit form to update personal details
     */
    updatePersonalDetails() {
        // Check if the user has modified their avatar
        if ((this.props.myPersonalDetails.avatar !== this.state.avatar.uri) && this.state.isAvatarChanged) {
            // If the user removed their profile photo, replace it accordingly with the default avatar
            if (this.state.avatar.uri.includes('/images/avatars/avatar')) {
                PersonalDetails.deleteAvatar(this.state.avatar.uri);
            } else {
                PersonalDetails.setAvatar(this.state.avatar);
            }

            // Reset the changed state
            this.setState({isAvatarChanged: false});
        }

        PersonalDetails.setPersonalDetails({
            firstName: this.state.firstName.trim(),
            lastName: this.state.lastName.trim(),
            pronouns: this.state.pronouns.trim(),
            timezone: {
                automatic: this.state.isAutomaticTimezone,
                selected: this.state.selectedTimezone,
            },
        }, true);
    }

    validate(values) {
        const errors = {};

        const [hasFirstNameError] = ValidationUtils.doesFailCharacterLimit(
            CONST.PROFILE_INPUTS_CHARACTER_LIMIT,
            [values.firstName.trim()],
        );

        if(hasFirstNameError) {
            this.setState({hasFirstNameError});
            errors.firstName = PersonalDetails.getMaxCharacterError(this.state.hasFirstNameError);
        }

        const [hasLastNameError] = ValidationUtils.doesFailCharacterLimit(
            CONST.PROFILE_INPUTS_CHARACTER_LIMIT,
            [values.lastName.trim()],
        );

        if(hasLastNameError) {
            this.setState({hasLastNameError});
            errors.lastName = PersonalDetails.getMaxCharacterError(this.state.hasLastNameError);
        }

        const [hasPronounError] = ValidationUtils.doesFailCharacterLimit(
            CONST.PROFILE_INPUTS_CHARACTER_LIMIT,
            [values.pronouns.trim()],
        );

        if(hasPronounError) {
            this.setState({hasPronounError});
            errors.pronouns = PersonalDetails.getMaxCharacterError(this.state.hasPronounError);
        }

        return errors;
    }

    render() {
        const pronounsList = _.map(this.props.translate('pronouns'), (value, key) => ({
            label: value,
            value: `${CONST.PRONOUNS.PREFIX}${key}`,
        }));

        const pronounsPickerValue = this.state.hasSelfSelectedPronouns ? CONST.PRONOUNS.SELF_SELECT : this.state.pronouns;

        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.profile')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <Form
                        style={[styles.flex1, styles.p5]}
                        formID={ONYXKEYS.FORMS.PROFILE_FORM}
                        validate={this.validate}
                        onSubmit={this.updatePersonalDetails}
                        submitButtonText={this.props.translate('common.save')}
                    >
                        <AvatarWithImagePicker
                            inputID="avatar"
                            isUploading={this.props.myPersonalDetails.avatarUploading}
                            isUsingDefaultAvatar={this.state.avatar.uri.includes('/images/avatars/avatar')}
                            avatarURL={this.state.avatar.uri}
                            onImageSelected={this.updateAvatar}
                            onImageRemoved={this.updateAvatar}
                            anchorPosition={styles.createMenuPositionProfile}
                            size={CONST.AVATAR_SIZE.LARGE}
                        />
                        <Text style={[styles.mt6, styles.mb6]}>
                            {this.props.translate('profilePage.tellUsAboutYourself')}
                        </Text>

                        <View style={[styles.flexRow, styles.mt4, styles.mb4]}>
                            <View style={styles.flex1}>
                                <TextInput
                                    inputID="firstName"
                                    name="fname"
                                    label={this.props.translate('common.firstName')}
                                    value={this.state.firstName}
                                    hasError={this.state.hasFirstNameError}
                                    errorText={PersonalDetails.getMaxCharacterError(this.state.hasFirstNameError)}
                                    onChangeText={firstName => this.setState({firstName})}
                                    placeholder={this.props.translate('profilePage.john')}
                                />
                            </View>
                            <View style={[styles.flex1, styles.ml2]}>
                                <TextInput
                                    inputID="lastName"
                                    name="lname"
                                    label={this.props.translate('common.lastName')}
                                    value={this.state.lastName}
                                    hasError={this.state.hasLastNameError}
                                    errorText={PersonalDetails.getMaxCharacterError(this.state.hasLastNameError)}
                                    onChangeText={lastName => this.setState({lastName})}
                                    placeholder={this.props.translate('profilePage.doe')}
                                />
                            </View>
                        </View>
                        <View style={styles.mb6}>
                            <Picker
                                inputID="pronounsPicker"
                                label={this.props.translate('profilePage.preferredPronouns')}
                                onInputChange={(pronouns) => {
                                    const hasSelfSelectedPronouns = pronouns === CONST.PRONOUNS.SELF_SELECT;
                                    this.setState({
                                        pronouns: hasSelfSelectedPronouns ? '' : pronouns,
                                        hasSelfSelectedPronouns,
                                    });
                                }}
                                items={pronounsList}
                                placeholder={{
                                    value: '',
                                    label: this.props.translate('profilePage.selectYourPronouns'),
                                }}
                                value={pronounsPickerValue}
                                shouldSaveDraft
                            />
                            {this.state.hasSelfSelectedPronouns && (
                                <View style={styles.mt2}>
                                    <TextInput
                                        inputID="pronounSelected"
                                        value={this.state.pronouns}
                                        onChangeText={pronouns => this.setState({pronouns})}
                                        placeholder={this.props.translate('profilePage.selfSelectYourPronoun')}
                                        hasError={this.state.hasPronounError}
                                        errorText={PersonalDetails.getMaxCharacterError(this.state.hasPronounError)}
                                    />
                                </View>
                            )}
                        </View>
                        <LoginField
                            inputID="loginEmail"
                            label={this.props.translate('profilePage.emailAddress')}
                            type="email"
                            login={this.state.logins.email}
                        />
                        <LoginField
                            inputID="loginPhoneNumber"
                            label={this.props.translate('common.phoneNumber')}
                            type="phone"
                            login={this.state.logins.phone}
                        />
                        <View style={styles.mb3}>
                            <Picker
                                inputID="timezonePicker"
                                label={this.props.translate('profilePage.timezone')}
                                onInputChange={selectedTimezone => this.setState({selectedTimezone})}
                                items={timezones}
                                isDisabled={this.state.isAutomaticTimezone}
                                value={this.state.selectedTimezone}
                                shouldSaveDraft
                            />
                        </View>
                        <CheckboxWithLabel
                            inputID="setTimezoneAutomatically"
                            label={this.props.translate('profilePage.setMyTimezoneAutomatically')}
                            isChecked={this.state.isAutomaticTimezone}
                            onInputChange={this.setAutomaticTimezone}
                            shouldSaveDraft
                        />
                    </Form>
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
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
    }),
)(ProfilePage);
