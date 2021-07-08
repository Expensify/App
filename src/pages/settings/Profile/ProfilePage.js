import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {
    View,
    TextInput,
    ScrollView,
} from 'react-native';
import Str from 'expensify-common/lib/str';
import moment from 'moment-timezone';
import _ from 'underscore';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../components/ScreenWrapper';
import {setPersonalDetails, setAvatar, deleteAvatar} from '../../../libs/actions/PersonalDetails';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import themeColors from '../../../styles/themes/default';
import LoginField from './LoginField';
import Picker from '../../../components/Picker';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import FixedFooter from '../../../components/FixedFooter';
import Growl from '../../../libs/Growl';
import FullNameInputRow from '../../../components/FullNameInputRow';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import AvatarWithImagePicker from '../../../components/AvatarWithImagePicker';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape({
        /** Email/Phone login of the current user from their personal details */
        login: PropTypes.string,

        /** Display first name of the current user from their personal details */
        firstName: PropTypes.string,

        /** Display last name of the current user from their personal details */
        lastName: PropTypes.string,

        /** Avatar URL of the current user from their personal details */
        avatar: PropTypes.string,

        /** Pronouns of the current user from their personal details */
        pronouns: PropTypes.string,

        /** Timezone of the current user from their personal details */
        timezone: PropTypes.shape({

            /** Value of selected timezone */
            selected: PropTypes.string,

            /** Whether timezone is automatically set */
            automatic: PropTypes.bool,
        }),
    }),

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

const timezones = moment.tz.names()
    .map(timezone => ({
        value: timezone,
        label: timezone,
    }));

class ProfilePage extends Component {
    constructor(props) {
        super(props);
        const {
            firstName,
            lastName,
            pronouns,
            timezone = {},
        } = props.myPersonalDetails;
        const pronounsList = Object.values(this.props.translate('pronouns'));

        let currentUserPronouns = pronouns;
        let initialSelfSelectedPronouns = '';

        // This handles populating the self-selected pronouns in the form
        if (pronouns && !pronounsList.includes(pronouns)) {
            currentUserPronouns = this.props.translate('pronouns.selfSelect');
            initialSelfSelectedPronouns = pronouns;
        }

        this.state = {
            firstName,
            lastName,
            pronouns: currentUserPronouns,
            selfSelectedPronouns: initialSelfSelectedPronouns,
            selectedTimezone: timezone.selected || CONST.DEFAULT_TIME_ZONE.selected,
            isAutomaticTimezone: timezone.automatic ?? CONST.DEFAULT_TIME_ZONE.automatic,
            logins: this.getLogins(props.user.loginList),
        };

        this.pronounDropdownValues = pronounsList.map(pronoun => ({value: pronoun, label: pronoun}));
        this.updatePersonalDetails = this.updatePersonalDetails.bind(this);
        this.setAutomaticTimezone = this.setAutomaticTimezone.bind(this);
        this.getLogins = this.getLogins.bind(this);
    }

    componentDidUpdate(prevProps) {
        // Recalculate logins if loginList has changed
        if (this.props.user.loginList !== prevProps.user.loginList) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                logins: this.getLogins(this.props.user.loginList),
            });
        }
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
        return loginList.reduce((logins, currentLogin) => {
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
        const {
            firstName,
            lastName,
            pronouns,
            selfSelectedPronouns,
            selectedTimezone,
            isAutomaticTimezone,
        } = this.state;

        setPersonalDetails({
            firstName,
            lastName,
            pronouns: pronouns === this.props.translate('pronouns.selfSelect')
                ? selfSelectedPronouns
                : pronouns,
            timezone: {
                automatic: isAutomaticTimezone,
                selected: selectedTimezone,
            },
        });

        Growl.show(this.props.translate('profilePage.growlMessageOnSave'), CONST.GROWL.SUCCESS, 3000);
    }

    render() {
        // Determines if the pronouns/selected pronouns have changed
        const arePronounsUnchanged = this.props.myPersonalDetails.pronouns === this.state.pronouns
            || (this.props.myPersonalDetails.pronouns
                && this.props.myPersonalDetails.pronouns === this.state.selfSelectedPronouns);

        // Disables button if none of the form values have changed
        const isButtonDisabled = (this.props.myPersonalDetails.firstName === this.state.firstName)
            && (this.props.myPersonalDetails.lastName === this.state.lastName)
            && (this.props.myPersonalDetails.timezone.selected === this.state.selectedTimezone)
            && (this.props.myPersonalDetails.timezone.automatic === this.state.isAutomaticTimezone)
            && arePronounsUnchanged;

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
                            avatarURL={this.props.myPersonalDetails.avatar}
                            onImageSelected={setAvatar}
                            onImageRemoved={() => deleteAvatar(this.props.myPersonalDetails.login)}
                            // eslint-disable-next-line max-len
                            isUsingDefaultAvatar={this.props.myPersonalDetails.avatar.includes('/images/avatars/avatar')}
                            anchorPosition={styles.createMenuPositionProfile}
                        />
                        <Text style={[styles.mt6, styles.mb6, styles.textP]}>
                            {this.props.translate('profilePage.tellUsAboutYourself')}
                        </Text>
                        <FullNameInputRow
                            firstName={this.state.firstName}
                            lastName={this.state.lastName}
                            onChangeFirstName={firstName => this.setState({firstName})}
                            onChangeLastName={lastName => this.setState({lastName})}
                            style={[styles.mt4, styles.mb4]}
                        />
                        <View style={styles.mb6}>
                            <Text style={[styles.mb1, styles.formLabel]}>
                                {this.props.translate('profilePage.preferredPronouns')}
                            </Text>
                            <View style={styles.mb1}>
                                <Picker
                                    onChange={pronouns => this.setState({pronouns, selfSelectedPronouns: ''})}
                                    items={this.pronounDropdownValues}
                                    placeholder={{
                                        value: '',
                                        label: this.props.translate('profilePage.selectYourPronouns'),
                                    }}
                                    value={this.state.pronouns}
                                />
                            </View>
                            {this.state.pronouns === this.props.translate('pronouns.selfSelect') && (
                            <TextInput
                                style={styles.textInput}
                                value={this.state.selfSelectedPronouns}
                                onChangeText={selfSelectedPronouns => this.setState({selfSelectedPronouns})}
                                placeholder={this.props.translate('profilePage.selfSelectYourPronoun')}
                                placeholderTextColor={themeColors.placeholderText}
                            />
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
                            <Text style={[styles.mb1, styles.formLabel]}>
                                {this.props.translate('profilePage.timezone')}
                            </Text>
                            <Picker
                                onChange={selectedTimezone => this.setState({selectedTimezone})}
                                items={timezones}
                                useDisabledStyles={this.state.isAutomaticTimezone}
                                value={this.state.selectedTimezone}
                                disabled={this.state.isAutomaticTimezone}
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
