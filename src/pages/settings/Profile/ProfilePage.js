import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AvatarWithImagePicker from '../../../components/AvatarWithImagePicker';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import MenuItem from '../../../components/MenuItem';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import CONST from '../../../CONST';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import * as ReportUtils from '../../../libs/ReportUtils';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import LoginField from './LoginField';
import * as Expensicons from '../../../components/Icon/Expensicons';

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

class ProfilePage extends Component {
    constructor(props) {
        super(props);

        this.defaultAvatar = ReportUtils.getDefaultAvatar(this.props.currentUserPersonalDetails.login);
        this.avatar = {uri: lodashGet(this.props.currentUserPersonalDetails, 'avatar') || this.defaultAvatar};
        this.state = {
            logins: this.getLogins(),
        };

        this.getLogins = this.getLogins.bind(this);
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

    getPronouns() {
        let pronounsKey = lodashGet(this.props.currentUserPersonalDetails, 'pronouns', '');
        if (pronounsKey.startsWith(CONST.PRONOUNS.PREFIX)) {
            pronounsKey = pronounsKey.slice(CONST.PRONOUNS.PREFIX.length);
        }
        return lodashGet(this.props.translate('pronouns'), pronounsKey, this.props.translate('profilePage.selectYourPronouns'));
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

    render() {
        const currentUserDetails = this.props.currentUserPersonalDetails || {};
        const profileSettingsOptions = [
            {
                description: this.props.translate('displayNamePage.headerTitle'),
                title: lodashGet(currentUserDetails, 'displayName', ''),
                pageRoute: ROUTES.SETTINGS_DISPLAY_NAME,
            },
            {
                description: this.props.translate('pronounsPage.pronouns'),
                title: this.getPronouns(),
                pageRoute: ROUTES.SETTINGS_PRONOUNS,
            },
            {
                description: this.props.translate('timezonePage.timezone'),
                title: `${lodashGet(currentUserDetails, 'timezone.selected', '')}`,
                pageRoute: ROUTES.SETTINGS_TIMEZONE,
            },
        ];
        return (
            <ScreenWrapper includeSafeAreaPadding={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('common.profile')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <ScrollView>
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
                    <View style={[styles.mt4]}>
                        {_.map(profileSettingsOptions, (detail, index) => (
                            <MenuItemWithTopDescription
                                key={`${detail.title}_${index}`}
                                shouldShowRightIcon
                                title={detail.title}
                                description={detail.description}
                                onPress={() => Navigation.navigate(detail.pageRoute)}
                            />
                        ))}
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
                    <MenuItem
                        title={this.props.translate('personalDetailsPages.personalDetails')}
                        icon={Expensicons.User}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS)}
                        shouldShowRightIcon
                    />
                </ScrollView>
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
