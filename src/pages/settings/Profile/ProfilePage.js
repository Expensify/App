import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {
    View,
    TextInput,
    Pressable,
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
import Avatar from '../../../components/Avatar';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import Icon from '../../../components/Icon';
import Checkbox from '../../../components/Checkbox';
import themeColors from '../../../styles/themes/default';
import LoginField from './LoginField';
import {DownArrow, Upload, Trashcan} from '../../../components/Icon/Expensicons';
import AttachmentPicker from '../../../components/AttachmentPicker';
import CreateMenu from '../../../components/CreateMenu';
import Picker from '../../../components/Picker';

const propTypes = {
    /* Onyx Props */
    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({
        // Email/Phone login of the current user from their personal details
        login: PropTypes.string,

        // Display first name of the current user from their personal details
        firstName: PropTypes.string,

        // Display last name of the current user from their personal details
        lastName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatar: PropTypes.string,

        // Pronouns of the current user from their personal details
        pronouns: PropTypes.string,

        // timezone of the current user from their personal details
        timezone: PropTypes.shape({

            // Value of selected timezone
            selected: PropTypes.string,

            // Whether timezone is automatically set
            automatic: PropTypes.bool,
        }),
    }),

    // The details about the user that is signed in
    user: PropTypes.shape({
        // Whether or not the user is subscribed to news updates
        loginList: PropTypes.arrayOf(PropTypes.shape({

            // Value of partner name
            partnerName: PropTypes.string,

            // Phone/Email associated with user
            partnerUserID: PropTypes.string,

            // Date of when login was validated
            validatedDate: PropTypes.string,
        })),
    }),
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
        const pronounsList = Object.values(CONST.PRONOUNS);

        let currentUserPronouns = pronouns;
        let initialSelfSelectedPronouns = '';

        // This handles populating the self-selected pronouns in the form
        if (pronouns && !pronounsList.includes(pronouns)) {
            currentUserPronouns = CONST.PRONOUNS.SELF_SELECT;
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
            isEditPhotoMenuVisible: false,
        };

        this.pronounDropdownValues = pronounsList.map(pronoun => ({value: pronoun, label: pronoun}));
        this.updatePersonalDetails = this.updatePersonalDetails.bind(this);
        this.setAutomaticTimezone = this.setAutomaticTimezone.bind(this);
        this.getLogins = this.getLogins.bind(this);
        this.createMenuItems = this.createMenuItems.bind(this);
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
            pronouns: pronouns === CONST.PRONOUNS.SELF_SELECT ? selfSelectedPronouns : pronouns,
            timezone: {
                automatic: isAutomaticTimezone,
                selected: selectedTimezone,
            },
        });
    }

    /**
     * Create menu items list for avatar menu
     *
     * @param {Function} openPicker
     * @returns {Array}
     */
    createMenuItems(openPicker) {
        const menuItems = [
            {
                icon: Upload,
                text: 'Upload Photo',
                onSelected: () => {
                    openPicker({
                        onPicked: setAvatar,
                    });
                },
            },
        ];

        // If current avatar isn't a default avatar, allow Remove Photo option
        if (!this.props.myPersonalDetails.avatar.includes('/images/avatars/avatar')) {
            menuItems.push({
                icon: Trashcan,
                text: 'Remove Photo',
                onSelected: () => {
                    deleteAvatar(this.props.myPersonalDetails.login);
                },
            });
        }
        return menuItems;
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
                <HeaderWithCloseButton
                    title="Profile"
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <View style={[styles.p5, styles.flex1, styles.overflowAuto]}>
                    <Avatar
                        style={[styles.avatarLarge, styles.alignSelfCenter]}
                        source={this.props.myPersonalDetails.avatar}
                    />
                    <AttachmentPicker>
                        {({openPicker}) => (
                            <>
                                <Pressable
                                    style={[styles.button, styles.alignSelfCenter, styles.mt3]}
                                    onPress={() => this.setState({isEditPhotoMenuVisible: true})}
                                >
                                    <View style={styles.flexRow}>
                                        <Icon src={DownArrow} />
                                        <View style={styles.justifyContentCenter}>
                                            <Text style={[styles.headerText, styles.ml2]}>
                                                Edit Photo
                                            </Text>
                                        </View>
                                    </View>
                                </Pressable>
                                <CreateMenu
                                    isVisible={this.state.isEditPhotoMenuVisible}
                                    onClose={() => this.setState({isEditPhotoMenuVisible: false})}
                                    onItemSelected={() => this.setState({isEditPhotoMenuVisible: false})}
                                    menuItems={this.createMenuItems(openPicker)}
                                />
                            </>
                        )}
                    </AttachmentPicker>
                    <Text style={[styles.mt6, styles.mb6, styles.textP]}>
                        Tell us about yourself, we would love to get to know you!
                    </Text>
                    <View style={[styles.flexRow, styles.mb6]}>
                        <View style={styles.flex1}>
                            <Text style={[styles.mb1, styles.formLabel]}>First Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={this.state.firstName}
                                onChangeText={firstName => this.setState({firstName})}
                                placeholder="John"
                                placeholderTextColor={themeColors.placeholderText}
                            />
                        </View>
                        <View style={[styles.flex1, styles.ml2]}>
                            <Text style={[styles.mb1, styles.formLabel]}>Last Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={this.state.lastName}
                                onChangeText={lastName => this.setState({lastName})}
                                placeholder="Doe"
                                placeholderTextColor={themeColors.placeholderText}
                            />
                        </View>
                    </View>
                    <View style={styles.mb6}>
                        <Text style={[styles.mb1, styles.formLabel]}>Preferred Pronouns</Text>
                        <View style={styles.mb1}>
                            <Picker
                                onChange={pronouns => this.setState({pronouns, selfSelectedPronouns: ''})}
                                items={this.pronounDropdownValues}
                                placeholder={{
                                    value: '',
                                    label: 'Select your pronouns',
                                }}
                                value={this.state.pronouns}
                                icon={() => <Icon src={DownArrow} />}
                            />
                        </View>
                        {this.state.pronouns === CONST.PRONOUNS.SELF_SELECT && (
                        <TextInput
                            style={styles.textInput}
                            value={this.state.selfSelectedPronouns}
                            onChangeText={selfSelectedPronouns => this.setState({selfSelectedPronouns})}
                            placeholder="Self-select your pronoun"
                            placeholderTextColor={themeColors.placeholderText}
                        />
                        )}
                    </View>
                    <LoginField label="Email Address" type="email" login={this.state.logins.email} />
                    <LoginField label="Phone Number" type="phone" login={this.state.logins.phone} />
                    <View style={styles.mb3}>
                        <Text style={[styles.mb1, styles.formLabel]}>Timezone</Text>
                        <Picker
                            onChange={selectedTimezone => this.setState({selectedTimezone})}
                            items={timezones}
                            useDisabledStyles={this.state.isAutomaticTimezone}
                            value={this.state.selectedTimezone}
                            icon={() => <Icon src={DownArrow} />}
                            disabled={this.state.isAutomaticTimezone}
                        />
                    </View>
                    <Checkbox
                        label="Set my timezone automatically"
                        isChecked={this.state.isAutomaticTimezone}
                        onClick={this.setAutomaticTimezone}
                    />
                </View>
                <View style={[styles.ph5, styles.pb5]}>
                    <Pressable
                        disabled={isButtonDisabled}
                        onPress={this.updatePersonalDetails}
                        style={({hovered}) => [
                            styles.button,
                            styles.buttonSuccess,
                            styles.w100,
                            hovered && styles.buttonSuccessHovered,
                            isButtonDisabled && styles.buttonDisable,
                        ]}
                    >
                        <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                            Save
                        </Text>
                    </Pressable>
                </View>
            </ScreenWrapper>
        );
    }
}

ProfilePage.propTypes = propTypes;
ProfilePage.defaultProps = defaultProps;
ProfilePage.displayName = 'ProfilePage';

export default withOnyx({
    myPersonalDetails: {
        key: ONYXKEYS.MY_PERSONAL_DETAILS,
    },
    user: {
        key: ONYXKEYS.USER,
    },
})(ProfilePage);
