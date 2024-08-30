import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemGroup from '@components/MenuItemGroup';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import variables from '@styles/variables';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {LoginList, PrivatePersonalDetails} from '@src/types/onyx';

type ProfilePageOnyxProps = {
    loginList: OnyxEntry<LoginList>;
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    /** Whether app is loading */
    isLoadingApp: OnyxEntry<boolean>;
};

type ProfilePageProps = ProfilePageOnyxProps & WithCurrentUserPersonalDetailsProps;

function ProfilePage({
    loginList,
    privatePersonalDetails = {
        legalFirstName: '',
        legalLastName: '',
        dob: '',
        addresses: [
            {
                street: '',
                street2: '',
                city: '',
                state: '',
                zip: '',
                country: '',
            },
        ],
    },
    currentUserPersonalDetails,
    isLoadingApp,
}: ProfilePageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const getPronouns = (): string => {
        const pronounsKey = currentUserPersonalDetails?.pronouns?.replace(CONST.PRONOUNS.PREFIX, '') ?? '';
        return pronounsKey ? translate(`pronouns.${pronounsKey}` as TranslationPaths) : translate('profilePage.selectYourPronouns');
    };

    const avatarURL = currentUserPersonalDetails?.avatar ?? '';
    const accountID = currentUserPersonalDetails?.accountID ?? '-1';

    const contactMethodBrickRoadIndicator = UserUtils.getLoginListBrickRoadIndicator(loginList);
    const emojiCode = currentUserPersonalDetails?.status?.emojiCode ?? '';
    const privateDetails = privatePersonalDetails ?? {};
    const legalName = `${privateDetails.legalFirstName ?? ''} ${privateDetails.legalLastName ?? ''}`.trim();

    const publicOptions = [
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

    const privateOptions = [
        {
            description: translate('privatePersonalDetails.legalName'),
            title: legalName,
            pageRoute: ROUTES.SETTINGS_LEGAL_NAME,
        },
        {
            description: translate('common.dob'),
            title: privateDetails.dob ?? '',
            pageRoute: ROUTES.SETTINGS_DATE_OF_BIRTH,
        },
        {
            description: translate('privatePersonalDetails.address'),
            title: PersonalDetailsUtils.getFormattedAddress(privateDetails),
            pageRoute: ROUTES.SETTINGS_ADDRESS,
        },
    ];

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ProfilePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('common.profile')}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton={shouldUseNarrowLayout}
                icon={Illustrations.Profile}
            />
            <ScrollView style={styles.pt3}>
                <MenuItemGroup>
                    <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            title={translate('profilePage.publicSection.title')}
                            subtitle={translate('profilePage.publicSection.subtitle')}
                            isCentralPane
                            subtitleMuted
                            childrenStyles={styles.pt5}
                            titleStyles={styles.accountSettingsSectionTitle}
                        >
                            <View style={[styles.pt3, styles.pb6, styles.alignSelfStart]}>
                                <MenuItemGroup shouldUseSingleExecution={false}>
                                    <AvatarWithImagePicker
                                        isUsingDefaultAvatar={UserUtils.isDefaultAvatar(currentUserPersonalDetails?.avatar ?? '')}
                                        source={avatarURL}
                                        avatarID={accountID}
                                        onImageSelected={PersonalDetails.updateAvatar}
                                        onImageRemoved={PersonalDetails.deleteAvatar}
                                        size={CONST.AVATAR_SIZE.XLARGE}
                                        avatarStyle={styles.avatarXLarge}
                                        pendingAction={currentUserPersonalDetails?.pendingFields?.avatar ?? undefined}
                                        errors={currentUserPersonalDetails?.errorFields?.avatar ?? null}
                                        errorRowStyles={styles.mt6}
                                        onErrorClose={PersonalDetails.clearAvatarErrors}
                                        onViewPhotoPress={() => Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(String(accountID)))}
                                        previewSource={UserUtils.getFullSizeAvatar(avatarURL, accountID)}
                                        originalFileName={currentUserPersonalDetails.originalFileName}
                                        headerTitle={translate('profilePage.profileAvatar')}
                                        fallbackIcon={currentUserPersonalDetails?.fallbackIcon}
                                        editIconStyle={styles.profilePageAvatar}
                                    />
                                </MenuItemGroup>
                            </View>
                            {publicOptions.map((detail, index) => (
                                <MenuItemWithTopDescription
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`${detail.title}_${index}`}
                                    shouldShowRightIcon
                                    title={detail.title}
                                    description={detail.description}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={() => Navigation.navigate(detail.pageRoute)}
                                    brickRoadIndicator={detail.brickRoadIndicator}
                                />
                            ))}
                            <View style={[styles.alignSelfStart, styles.pt3]}>
                                <Tooltip text={translate('common.shareCode')}>
                                    <PressableWithFeedback
                                        accessibilityLabel={translate('common.shareCode')}
                                        accessibilityRole="button"
                                        accessible
                                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_SHARE_CODE)}
                                        style={[styles.button, styles.flexRow, styles.gap1, styles.ph4]}
                                    >
                                        <Icon
                                            src={Expensicons.QrCode}
                                            width={variables.iconSizeNormal}
                                            height={variables.iconSizeNormal}
                                            fill={theme.icon}
                                        />
                                        <Text style={styles.buttonText}>{translate('common.share')}</Text>
                                    </PressableWithFeedback>
                                </Tooltip>
                            </View>
                        </Section>
                        <Section
                            title={translate('profilePage.privateSection.title')}
                            subtitle={translate('profilePage.privateSection.subtitle')}
                            isCentralPane
                            subtitleMuted
                            childrenStyles={styles.pt3}
                            titleStyles={styles.accountSettingsSectionTitle}
                        >
                            {isLoadingApp ? (
                                <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative, StyleUtils.getBackgroundColorStyle(theme.cardBG)]} />
                            ) : (
                                <>
                                    {privateOptions.map((detail, index) => (
                                        <MenuItemWithTopDescription
                                            // eslint-disable-next-line react/no-array-index-key
                                            key={`${detail.title}_${index}`}
                                            shouldShowRightIcon
                                            title={detail.title}
                                            description={detail.description}
                                            wrapperStyle={styles.sectionMenuItemTopDescription}
                                            onPress={() => Navigation.navigate(detail.pageRoute)}
                                        />
                                    ))}
                                </>
                            )}
                        </Section>
                    </View>
                </MenuItemGroup>
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
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
    })(ProfilePage),
);
