import React, {useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
import * as App from '@userActions/App';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {LoginList, PersonalDetails as PersonalDetailsType, User} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

type ProfilePageOnyxProps = {
    loginList: OnyxEntry<LoginList>;
    user: OnyxEntry<User>;
};

type ProfilePageProps = ProfilePageOnyxProps & WithCurrentUserPersonalDetailsProps;

function ProfilePage({loginList, user, currentUserPersonalDetails}: ProfilePageProps) {
    const styles = useThemeStyles();

    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();

    const getPronouns = (): string => {
        const pronounsKey = currentUserPersonalDetails?.pronouns?.replace(CONST.PRONOUNS.PREFIX, '') ?? '';
        return pronounsKey ? translate(`pronouns.${pronounsKey}` as TranslationPaths) : translate('profilePage.selectYourPronouns');
    };

    const contactMethodBrickRoadIndicator = loginList ? UserUtils.getLoginListBrickRoadIndicator(loginList) : undefined;
    const avatarURL = currentUserPersonalDetails?.avatar ?? '';
    const accountID = currentUserPersonalDetails?.accountID ?? '';
    const emojiCode = currentUserPersonalDetails?.status?.emojiCode ?? '';

    const profileSettingsOptions = [
        {
            description: translate('displayNamePage.headerTitle'),
            title: currentUserPersonalDetails?.displayName ?? '',
            pageRoute: ROUTES.SETTINGS_DISPLAY_NAME,
        },
        {
            description: translate('contacts.contactMethod'),
            title: LocalePhoneNumber.formatPhoneNumber(currentUserPersonalDetails?.login ?? ''),
            pageRoute: ROUTES.SETTINGS_CONTACT_METHODS.route,
            brickRoadIndicator: contactMethodBrickRoadIndicator,
        },
        {
            description: translate('statusPage.status'),
            title: emojiCode ? `${emojiCode} ${currentUserPersonalDetails?.status?.text ?? ''}` : '',
            pageRoute: ROUTES.SETTINGS_STATUS,
        },
        {
            description: translate('pronounsPage.pronouns'),
            title: getPronouns(),
            pageRoute: ROUTES.SETTINGS_PRONOUNS,
        },
        {
            description: translate('timezonePage.timezone'),
            title: currentUserPersonalDetails?.timezone?.selected ?? '',
            pageRoute: ROUTES.SETTINGS_TIMEZONE,
        },
    ];

    useEffect(() => {
        App.openProfile(currentUserPersonalDetails as PersonalDetailsType);
    }, [currentUserPersonalDetails]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ProfilePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.profile')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            />
            <ScrollView>
                <AvatarWithImagePicker
                    isUsingDefaultAvatar={UserUtils.isDefaultAvatar(currentUserPersonalDetails?.avatar ?? '')}
                    source={UserUtils.getAvatar(avatarURL, accountID)}
                    onImageSelected={PersonalDetails.updateAvatar}
                    onImageRemoved={PersonalDetails.deleteAvatar}
                    anchorPosition={styles.createMenuPositionProfile(windowWidth)}
                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                    size={CONST.AVATAR_SIZE.LARGE}
                    pendingAction={currentUserPersonalDetails?.pendingFields?.avatar ?? null}
                    errors={currentUserPersonalDetails?.errorFields?.avatar ?? null}
                    errorRowStyles={[styles.mt6]}
                    onErrorClose={PersonalDetails.clearAvatarErrors}
                    onViewPhotoPress={() => Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(accountID))}
                    previewSource={UserUtils.getFullSizeAvatar(avatarURL, accountID)}
                    originalFileName={currentUserPersonalDetails?.originalFileName}
                    headerTitle={translate('profilePage.profileAvatar')}
                    style={[styles.mh5]}
                    fallbackIcon={currentUserPersonalDetails?.fallbackIcon}
                />
                <View style={[styles.mt4]}>
                    {profileSettingsOptions.map((detail, index) => (
                        <MenuItemWithTopDescription
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${detail.title}_${index}`}
                            shouldShowRightIcon
                            title={detail.title}
                            description={detail.description}
                            onPress={() => Navigation.navigate(detail.pageRoute)}
                            brickRoadIndicator={detail.brickRoadIndicator}
                        />
                    ))}
                </View>
                <MenuItem
                    title={translate('privatePersonalDetails.personalDetails')}
                    icon={Expensicons.User}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS)}
                    shouldShowRightIcon
                />
                {user?.hasLoungeAccess && (
                    <MenuItem
                        title={translate('loungeAccessPage.loungeAccess')}
                        icon={Expensicons.LoungeAccess as IconAsset}
                        iconWidth={40}
                        iconHeight={40}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_LOUNGE_ACCESS)}
                        shouldShowRightIcon
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

ProfilePage.displayName = 'ProfilePage';

export default withCurrentUserPersonalDetails(
    withOnyx<ProfilePageProps, ProfilePageOnyxProps>({
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    })(ProfilePage),
);
