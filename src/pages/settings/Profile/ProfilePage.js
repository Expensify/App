import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
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
import ExpensifyText from '../../../components/ExpensifyText';
import LoginField from './LoginField';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import FixedFooter from '../../../components/FixedFooter';
import ExpensiTextInput from '../../../components/ExpensiTextInput';
import ExpensiPicker from '../../../components/ExpensiPicker';
import FullNameInputRow from '../../../components/FullNameInputRow';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import AvatarWithImagePicker from '../../../components/AvatarWithImagePicker';
import currentUserPersonalDetailsPropsTypes from './currentUserPersonalDetailsPropsTypes';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape(currentUserPersonalDetailsPropsTypes),

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        loginList: PropTypes.arrayOf(PropTypes.shape({

            /** Value of partner name */
            partnerName: PropTypes.string,

            /** Phone/Email associated with user */
            partnerUserID: PropTypes.string,

            /** Date of when login was validated */
            validatedDate: PropTypes.string,
        })),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    myPersonalDetails: {},
    user: {
        loginList: [],
    },
};

const timezones = _.map(moment.tz.names(), timezone => ({
    value: timezone,
    label: timezone,
}));

class ProfilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: props.myPersonalDetails.firstName,
            firstNameError: '',
            lastName: props.myPersonalDetails.lastName,
            lastNameError: '',
            pronouns: props.myPersonalDetails.pronouns,
            hasSelfSelectedPronouns: !_.isEmpty(props.myPersonalDetails.pronouns) && !props.myPersonalDetails.pronouns.startsWith(CONST.PRONOUNS.PREFIX),
            selectedTimezone: lodashGet(props.myPersonalDetails.timezone, 'selected', CONST.DEFAULT_TIME_ZONE.selected),
            isAutomaticTimezone: lodashGet(props.myPersonalDetails.timezone, 'automatic', CONST.DEFAULT_TIME_ZONE.automatic),
            logins: this.getLogins(props.user.loginList),
        };
        this.getLogins = this.getLogins.bind(this);
        this.setAutomaticTimezone = this.setAutomaticTimezone.bind(this);
        this.updatePersonalDetails = this.updatePersonalDetails.bind(this);
        this.validateInputs = this.validateInputs.bind(this);
    }

    componentDidUpdate(prevProps) {
        // Recalculate logins if loginList has changed
        if (this.props.user.loginList === prevProps.user.loginList) {
            return;
        }

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
            logins: this.getLogins(this.props.user.loginList),
        });
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
     * Submit form to update personal details
     */
    updatePersonalDetails() {
        if (!this.validateInputs()) {
            return;
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

    validateInputs() {
        const {firstNameError, lastNameError} = PersonalDetails.getFirstAndLastNameErrors(this.state.firstName, this.state.lastName);

        this.setState({
            firstNameError,
            lastNameError,
        });
        return _.isEmpty(firstNameError) && _.isEmpty(lastNameError);
    }

    render() {
        const pronounsList = _.map(this.props.translate('pronouns'), (value, key) => ({
            label: value,
            value: `${CONST.PRONOUNS.PREFIX}${key}`,
        }));

        // Determines if the pronouns/selected pronouns have changed
        const arePronounsUnchanged = this.props.myPersonalDetails.pronouns === this.state.pronouns;

        // Disables button if none of the form values have changed
        const isButtonDisabled = (this.props.myPersonalDetails.firstName === this.state.firstName.trim())
            && (this.props.myPersonalDetails.lastName === this.state.lastName.trim())
            && (this.props.myPersonalDetails.timezone.selected === this.state.selectedTimezone)
            && (this.props.myPersonalDetails.timezone.automatic === this.state.isAutomaticTimezone)
            && arePronounsUnchanged;

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
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <AvatarWithImagePicker
                            isUploading={this.props.myPersonalDetails.avatarUploading}
                            avatarURL={this.props.myPersonalDetails.avatar}
                            onImageSelected={PersonalDetails.setAvatar}
                            onImageRemoved={() => PersonalDetails.deleteAvatar(this.props.myPersonalDetails.login)}
                            // eslint-disable-next-line max-len
                            isUsingDefaultAvatar={this.props.myPersonalDetails.avatar.includes('/images/avatars/avatar')}
                            anchorPosition={styles.createMenuPositionProfile}
                            size={CONST.AVATAR_SIZE.LARGE}
                        />
                        <ExpensifyText style={[styles.mt6, styles.mb6]}>
                            {this.props.translate('profilePage.tellUsAboutYourself')}
                        </ExpensifyText>
                        <FullNameInputRow
                            firstName={this.state.firstName}
                            firstNameError={this.state.firstNameError}
                            lastName={this.state.lastName}
                            lastNameError={this.state.lastNameError}
                            onChangeFirstName={firstName => this.setState({firstName})}
                            onChangeLastName={lastName => this.setState({lastName})}
                            style={[styles.mt4, styles.mb4]}
                        />
                        <View style={styles.mb6}>
                            <ExpensiPicker
                                label={this.props.translate('profilePage.preferredPronouns')}
                                onChange={(pronouns) => {
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
                            />
                            {this.state.hasSelfSelectedPronouns && (
                                <View style={styles.mt2}>
                                    <ExpensiTextInput
                                        value={this.state.pronouns}
                                        onChangeText={pronouns => this.setState({pronouns})}
                                        placeholder={this.props.translate('profilePage.selfSelectYourPronoun')}
                                    />
                                </View>
                            )}
                        </View>
                        <LoginField
                            label={this.props.translate('profilePage.emailAddress')}
                            type="email"
                            login={this.state.logins.email}
                        />
                        <LoginField
                            label={this.props.translate('common.phoneNumber')}
                            type="phone"
                            login={this.state.logins.phone}
                        />
                        <View style={styles.mb3}>
                            <ExpensiPicker
                                label={this.props.translate('profilePage.timezone')}
                                onChange={selectedTimezone => this.setState({selectedTimezone})}
                                items={timezones}
                                isDisabled={this.state.isAutomaticTimezone}
                                value={this.state.selectedTimezone}
                            />
                        </View>
                        <CheckboxWithLabel
                            label={this.props.translate('profilePage.setMyTimezoneAutomatically')}
                            isChecked={this.state.isAutomaticTimezone}
                            onPress={this.setAutomaticTimezone}
                        />
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            success
                            isDisabled={isButtonDisabled}
                            onPress={this.updatePersonalDetails}
                            style={[styles.w100]}
                            text={this.props.translate('common.save')}
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
