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
import * as Localize from '../../../libs/Localize';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import TextInput from '../../../components/TextInput';
import Picker from '../../../components/Picker';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import AvatarWithImagePicker from '../../../components/AvatarWithImagePicker';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import * as ReportUtils from '../../../libs/ReportUtils';
import Form from '../../../components/Form';

const propTypes = {
    /* Onyx Props */

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
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    loginList: [],
    ...withCurrentUserPersonalDetailsDefaultProps,
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

        this.defaultAvatar = ReportUtils.getDefaultAvatar(this.props.currentUserPersonalDetails.login);
        this.logins = this.getLogins(props.loginList);
        this.avatar = {uri: lodashGet(this.props.currentUserPersonalDetails, 'avatar', ReportUtils.getDefaultAvatar(this.props.currentUserPersonalDetails.login))};
        this.pronouns = props.currentUserPersonalDetails.pronouns;
        this.state = {
            selectedTimezone: lodashGet(props.currentUserPersonalDetails.timezone, 'selected', CONST.DEFAULT_TIME_ZONE.selected),
            isAutomaticTimezone: lodashGet(props.currentUserPersonalDetails.timezone, 'automatic', CONST.DEFAULT_TIME_ZONE.automatic),
            hasSelfSelectedPronouns: !_.isEmpty(props.currentUserPersonalDetails.pronouns) && !props.currentUserPersonalDetails.pronouns.startsWith(CONST.PRONOUNS.PREFIX),
            isAvatarChanged: false,
        };

        this.getLogins = this.getLogins.bind(this);
        this.validate = this.validate.bind(this);
        this.updatePersonalDetails = this.updatePersonalDetails.bind(this);
        this.updateAvatar = this.updateAvatar.bind(this);
    }

    componentDidUpdate(prevProps) {
        // Recalculate logins if loginList has changed
        if (this.props.loginList === prevProps.loginList) {
            return;
        }
        this.logins = this.getLogins(this.props.loginList);
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
            if ((login !== this.props.currentUserPersonalDetails.login) && !_.isEmpty(logins[type])
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
        this.avatar = _.isUndefined(avatar) ? {uri: ReportUtils.getDefaultAvatar(this.props.currentUserPersonalDetails.login)} : avatar;

        this.setState({isAvatarChanged: true});
    }

    /**
     * Submit form to update personal details
     * @param {Object} values
     */
    updatePersonalDetails(values) {
        // Check if the user has modified their avatar
        if ((this.props.currentUserPersonalDetails.avatar !== this.avatar.uri) && this.state.isAvatarChanged) {
            // If the user removed their profile photo, replace it accordingly with the default avatar
            if (this.avatar.uri.includes('/images/avatars/avatar')) {
                PersonalDetails.deleteAvatar(this.avatar.uri);
            } else {
                PersonalDetails.setAvatar(this.avatar);
            }

            // Reset the changed state
            this.setState({isAvatarChanged: false});
        }

        PersonalDetails.setPersonalDetails({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            pronouns: (this.state.hasSelfSelectedPronouns) ? values.selfSelectedPronoun.trim() : values.pronouns.trim(),
            timezone: {
                automatic: values.isAutomaticTimezone,
                selected: values.timezone,
            },
        }, true);
    }

    /**
     * @param {Object} values - An object containing the value of each inputID
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};

        const [hasFirstNameError, hasLastNameError, hasPronounError] = ValidationUtils.doesFailCharacterLimitAfterTrim(
            CONST.FORM_CHARACTER_LIMIT,
            [values.firstName, values.lastName, values.pronouns],
        );

        const hasSelfSelectedPronouns = values.pronouns === CONST.PRONOUNS.SELF_SELECT;
        this.pronouns = hasSelfSelectedPronouns ? '' : values.pronouns;
        this.setState({
            hasSelfSelectedPronouns,
            isAutomaticTimezone: values.isAutomaticTimezone,
            selectedTimezone: values.isAutomaticTimezone ? moment.tz.guess() : values.timezone,
        });

        if (hasFirstNameError) {
            errors.firstName = Localize.translateLocal('personalDetails.error.characterLimit', {limit: CONST.FORM_CHARACTER_LIMIT});
        }

        if (hasLastNameError) {
            errors.lastName = Localize.translateLocal('personalDetails.error.characterLimit', {limit: CONST.FORM_CHARACTER_LIMIT});
        }

        if (hasPronounError) {
            errors.pronouns = Localize.translateLocal('personalDetails.error.characterLimit', {limit: CONST.FORM_CHARACTER_LIMIT});
        }

        return errors;
    }

    render() {
        const pronounsList = _.map(this.props.translate('pronouns'), (value, key) => ({
            label: value,
            value: `${CONST.PRONOUNS.PREFIX}${key}`,
        }));

        const pronounsPickerValue = this.state.hasSelfSelectedPronouns ? CONST.PRONOUNS.SELF_SELECT : this.pronouns;

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
                        style={[styles.flexGrow1, styles.p5]}
                        formID={ONYXKEYS.FORMS.PROFILE_SETTINGS_FORM}
                        validate={this.validate}
                        onSubmit={this.updatePersonalDetails}
                        submitButtonText={this.props.translate('common.save')}
                    >
                        <AvatarWithImagePicker
                            isUploading={this.props.currentUserPersonalDetails.avatarUploading}
                            isUsingDefaultAvatar={this.avatar.uri.includes('/images/avatars/avatar')}
                            avatarURL={this.avatar.uri}
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
                                    defaultValue={this.props.currentUserPersonalDetails.firstName}
                                    placeholder={this.props.translate('profilePage.john')}
                                    shouldSaveDraft
                                />
                            </View>
                            <View style={[styles.flex1, styles.ml2]}>
                                <TextInput
                                    inputID="lastName"
                                    name="lname"
                                    label={this.props.translate('common.lastName')}
                                    defaultValue={this.props.currentUserPersonalDetails.lastName}
                                    placeholder={this.props.translate('profilePage.doe')}
                                    shouldSaveDraft
                                />
                            </View>
                        </View>
                        <View style={styles.mb6}>
                            <Picker
                                inputID="pronouns"
                                label={this.props.translate('profilePage.preferredPronouns')}
                                items={pronounsList}
                                placeholder={{
                                    value: '',
                                    label: this.props.translate('profilePage.selectYourPronouns'),
                                }}
                                defaultValue={pronounsPickerValue}
                                shouldSaveDraft
                            />
                            {this.state.hasSelfSelectedPronouns && (
                                <View style={styles.mt2}>
                                    <TextInput
                                        inputID="selfSelectedPronoun"
                                        defaultValue={this.pronouns}
                                        placeholder={this.props.translate('profilePage.selfSelectYourPronoun')}
                                        shouldSaveDraft
                                    />
                                </View>
                            )}
                        </View>
                        <LoginField
                            label={this.props.translate('profilePage.emailAddress')}
                            type="email"
                            login={this.logins.email}
                            defaultValue={this.logins.email}
                        />
                        <LoginField
                            label={this.props.translate('common.phoneNumber')}
                            type="phone"
                            login={this.logins.phone}
                            defaultValue={this.logins.phone}
                        />
                        <View style={styles.mb3}>
                            <Picker
                                inputID="timezone"
                                label={this.props.translate('profilePage.timezone')}
                                items={timezones}
                                isDisabled={this.state.isAutomaticTimezone}
                                defaultValue={this.state.selectedTimezone}
                                value={this.state.selectedTimezone}
                                shouldSaveDraft
                            />
                        </View>
                        <CheckboxWithLabel
                            inputID="isAutomaticTimezone"
                            label={this.props.translate('profilePage.setMyTimezoneAutomatically')}
                            defaultValue={this.state.isAutomaticTimezone}
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
    withCurrentUserPersonalDetails,
    withOnyx({
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
    }),
)(ProfilePage);
