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
import TextInput from '../../../components/TextInput';
import Picker from '../../../components/Picker';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import AvatarWithImagePicker from '../../../components/AvatarWithImagePicker';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import * as ReportUtils from '../../../libs/ReportUtils';
import Form from '../../../components/Form';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';

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

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    loginList: {},
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
        this.avatar = {uri: lodashGet(this.props.currentUserPersonalDetails, 'avatar') || this.defaultAvatar};
        this.pronouns = props.currentUserPersonalDetails.pronouns;
        this.state = {
            logins: this.getLogins(),
            selectedTimezone: lodashGet(props.currentUserPersonalDetails.timezone, 'selected', CONST.DEFAULT_TIME_ZONE.selected),
            isAutomaticTimezone: lodashGet(props.currentUserPersonalDetails.timezone, 'automatic', CONST.DEFAULT_TIME_ZONE.automatic),
            hasSelfSelectedPronouns: !_.isEmpty(props.currentUserPersonalDetails.pronouns) && !props.currentUserPersonalDetails.pronouns.startsWith(CONST.PRONOUNS.PREFIX),
        };

        this.getLogins = this.getLogins.bind(this);
        this.validate = this.validate.bind(this);
        this.updatePersonalDetails = this.updatePersonalDetails.bind(this);
        this.setPronouns = this.setPronouns.bind(this);
        this.setAutomaticTimezone = this.setAutomaticTimezone.bind(this);
    }

    componentDidUpdate(prevProps) {
        let stateToUpdate = {};

        // Recalculate logins if loginList has changed
        if (_.keys(this.props.loginList).length !== _.keys(prevProps.loginList).length) {
            stateToUpdate = {...stateToUpdate, logins: this.getLogins()};
        }

        if (_.isEmpty(stateToUpdate)) {
            return;
        }

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState(stateToUpdate);
    }

    /**
     * @param {String} pronouns
     */
    setPronouns(pronouns) {
        const hasSelfSelectedPronouns = pronouns === CONST.PRONOUNS.SELF_SELECT;
        this.pronouns = hasSelfSelectedPronouns ? '' : pronouns;

        if (this.state.hasSelfSelectedPronouns === hasSelfSelectedPronouns) {
            return;
        }

        this.setState({hasSelfSelectedPronouns});
    }

    /**
     * Update the timezone picker's value to guessed timezone
     * @param {Boolean} isAutomaticTimezone
     */
    setAutomaticTimezone(isAutomaticTimezone) {
        if (!isAutomaticTimezone) {
            this.setState({isAutomaticTimezone});
            return;
        }

        this.setState({
            selectedTimezone: moment.tz.guess(),
            isAutomaticTimezone,
        });
    }

    /**
     * Get the most validated login of each type
     *
     * @returns {Object}
     */
    getLogins() {
        return _.reduce(_.values(this.props.loginList), (logins, currentLogin) => {
            const type = Str.isSMSLogin(currentLogin.partnerUserID) ? CONST.LOGIN_TYPE.PHONE : CONST.LOGIN_TYPE.EMAIL;
            const login = Str.removeSMSDomain(currentLogin.partnerUserID);

            // If there's already a login type that's validated and/or currentLogin isn't valid then return early
            if ((login !== lodashGet(this.props.currentUserPersonalDetails, 'login')) && !_.isEmpty(logins[type])
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
     * Submit form to update personal details
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.lastName
     * @param {String} values.pronouns
     * @param {Boolean} values.isAutomaticTimezone
     * @param {String} values.timezone
     * @param {String} values.selfSelectedPronoun
     */
    updatePersonalDetails(values) {
        PersonalDetails.updateProfile(
            values.firstName.trim(),
            values.lastName.trim(),
            (this.state.hasSelfSelectedPronouns) ? values.selfSelectedPronoun.trim() : values.pronouns.trim(),
            {
                automatic: values.isAutomaticTimezone,
                selected: values.timezone,
            },
        );
    }

    /**
     * @param {Object} values - An object containing the value of each inputID
     * @param {String} values.firstName
     * @param {String} values.lastName
     * @param {String} values.pronouns
     * @param {Boolean} values.isAutomaticTimezone
     * @param {String} values.timezone
     * @param {String} values.selfSelectedPronoun
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};
        let firstNameHasInvalidCharacters = false;
        let lastNameHasInvalidCharacters = false;

        if (firstNameHasInvalidCharacters || lastNameHasInvalidCharacters) {
            return errors;
        }

        const [hasFirstNameError, hasLastNameError, hasPronounError] = ValidationUtils.doesFailCharacterLimitAfterTrim(
            CONST.FORM_CHARACTER_LIMIT,
            [values.firstName, values.lastName, values.pronouns],
        );

        const characterLimitError = Localize.translateLocal('personalDetails.error.characterLimit', {limit: CONST.FORM_CHARACTER_LIMIT});

        errors.firstName = hasFirstNameError ? characterLimitError : '';
        errors.lastName = hasLastNameError ? characterLimitError : '';
        errors.pronouns = hasPronounError ? characterLimitError : '';

        return errors;
    }

    render() {
        const pronounsList = _.map(this.props.translate('pronouns'), (value, key) => ({
            label: value,
            value: `${CONST.PRONOUNS.PREFIX}${key}`,
        }));
        const currentUserDetails = this.props.currentUserPersonalDetails || {};
        const pronounsPickerValue = this.state.hasSelfSelectedPronouns ? CONST.PRONOUNS.SELF_SELECT : this.pronouns;

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.profile')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.PROFILE_SETTINGS_FORM}
                    validate={this.validate}
                    onSubmit={this.updatePersonalDetails}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <OfflineWithFeedback
                        pendingAction={lodashGet(this.props.currentUserPersonalDetails, 'pendingFields.avatar', null)}
                        errors={lodashGet(this.props.currentUserPersonalDetails, 'errorFields.avatar', null)}
                        errorRowStyles={[styles.mt6]}
                        onClose={PersonalDetails.clearAvatarErrors}
                    >
                        <AvatarWithImagePicker
                            isUsingDefaultAvatar={lodashGet(currentUserDetails, 'avatar', '').includes('/images/avatars/avatar')}
                            avatarURL={currentUserDetails.avatar}
                            onImageSelected={PersonalDetails.updateAvatar}
                            onImageRemoved={PersonalDetails.deleteAvatar}
                            anchorPosition={styles.createMenuPositionProfile}
                            size={CONST.AVATAR_SIZE.LARGE}
                        />
                    </OfflineWithFeedback>
                    <Text style={[styles.mt6, styles.mb6]}>
                        {this.props.translate('profilePage.tellUsAboutYourself')}
                    </Text>

                    <View style={[styles.flexRow, styles.mt4, styles.mb4]}>
                        <View style={styles.flex1}>
                            <TextInput
                                inputID="firstName"
                                name="fname"
                                label={this.props.translate('common.firstName')}
                                defaultValue={lodashGet(currentUserDetails, 'firstName', '')}
                                placeholder={this.props.translate('profilePage.john')}
                            />
                        </View>
                        <View style={[styles.flex1, styles.ml2]}>
                            <TextInput
                                inputID="lastName"
                                name="lname"
                                label={this.props.translate('common.lastName')}
                                defaultValue={lodashGet(currentUserDetails, 'lastName', '')}
                                placeholder={this.props.translate('profilePage.doe')}
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
                            onValueChange={this.setPronouns}
                        />
                        {this.state.hasSelfSelectedPronouns && (
                            <View style={styles.mt2}>
                                <TextInput
                                    inputID="selfSelectedPronoun"
                                    defaultValue={this.pronouns}
                                    placeholder={this.props.translate('profilePage.selfSelectYourPronoun')}
                                />
                            </View>
                        )}
                    </View>
                    <LoginField
                        label={this.props.translate('profilePage.emailAddress')}
                        type="email"
                        login={this.state.logins.email}
                        defaultValue={this.state.logins.email}
                    />
                    <LoginField
                        label={this.props.translate('common.phoneNumber')}
                        type="phone"
                        login={this.state.logins.phone}
                        defaultValue={this.state.logins.phone}
                    />
                    <View style={styles.mb3}>
                        <Picker
                            inputID="timezone"
                            label={this.props.translate('profilePage.timezone')}
                            items={timezones}
                            isDisabled={this.state.isAutomaticTimezone}
                            value={this.state.selectedTimezone}
                            onValueChange={selectedTimezone => this.setState({selectedTimezone})}
                        />
                    </View>
                    <CheckboxWithLabel
                        inputID="isAutomaticTimezone"
                        label={this.props.translate('profilePage.setMyTimezoneAutomatically')}
                        defaultValue={this.state.isAutomaticTimezone}
                        onValueChange={this.setAutomaticTimezone}
                    />
                </Form>
            </ScreenWrapper>
        );
    }
}

ProfilePage.propTypes = propTypes;
ProfilePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx({
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
    }),
)(ProfilePage);
