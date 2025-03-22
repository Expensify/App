import {useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AvatarSkeleton from '@components/AvatarSkeleton';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import Button from '@components/Button';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemGroup from '@components/MenuItemGroup';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getFormattedAddress} from '@libs/PersonalDetailsUtils';
import {getFullSizeAvatar, getLoginListBrickRoadIndicator, isDefaultAvatar} from '@libs/UserUtils';
import {clearAvatarErrors, deleteAvatar, updateAvatar} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function ProfilePage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const scrollEnabled = useScrollEnabled();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.ROOT>>();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const getPronouns = (): string => {
        const pronounsKey = currentUserPersonalDetails?.pronouns?.replace(CONST.PRONOUNS.PREFIX, '') ?? '';
        return pronounsKey ? translate(`pronouns.${pronounsKey}` as TranslationPaths) : translate('profilePage.selectYourPronouns');
    };

    const avatarURL = currentUserPersonalDetails?.avatar ?? '';
    const accountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;

    const contactMethodBrickRoadIndicator = getLoginListBrickRoadIndicator(loginList);
    const emojiCode = currentUserPersonalDetails?.status?.emojiCode ?? '';
    const privateDetails = privatePersonalDetails ?? {};
    const legalName = `${privateDetails.legalFirstName ?? ''} ${privateDetails.legalLastName ?? ''}`.trim();

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const publicOptions = [
        {
            description: translate('displayNamePage.headerTitle'),
            title: currentUserPersonalDetails?.displayName ?? '',
            pageRoute: ROUTES.SETTINGS_DISPLAY_NAME,
        },
        {
            description: translate('contacts.contactMethod'),
            title: formatPhoneNumber(currentUserPersonalDetails?.login ?? ''),
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
            action: () => {
                if (isActingAsDelegate) {
                    setIsNoDelegateAccessMenuVisible(true);
                    return;
                }
                Navigation.navigate(ROUTES.SETTINGS_LEGAL_NAME);
            },
        },
        {
            description: translate('common.dob'),
            title: privateDetails.dob ?? '',
            action: () => {
                if (isActingAsDelegate) {
                    setIsNoDelegateAccessMenuVisible(true);
                    return;
                }
                Navigation.navigate(ROUTES.SETTINGS_DATE_OF_BIRTH);
            },
        },
        {
            description: translate('common.phoneNumber'),
            title: privateDetails.phoneNumber ?? '',
            action: () => {
                if (isActingAsDelegate) {
                    setIsNoDelegateAccessMenuVisible(true);
                    return;
                }
                Navigation.navigate(ROUTES.SETTINGS_PHONE_NUMBER);
            },
            brickRoadIndicator: privatePersonalDetails?.errorFields?.phoneNumber ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            description: translate('privatePersonalDetails.address'),
            title: getFormattedAddress(privateDetails),
            action: () => {
                if (isActingAsDelegate) {
                    setIsNoDelegateAccessMenuVisible(true);
                    return;
                }
                Navigation.navigate(ROUTES.SETTINGS_ADDRESS);
            },
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
                onBackButtonPress={() => Navigation.goBack(route.params?.backTo)}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                icon={Illustrations.Profile}
                shouldUseHeadlineHeader
            />
            <ScrollView
                style={styles.pt3}
                contentContainerStyle={safeAreaPaddingBottomStyle}
                scrollEnabled={scrollEnabled}
            >
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
                            <View style={[styles.pt3, styles.pb6, styles.alignSelfStart, styles.w100]}>
                                {isEmptyObject(currentUserPersonalDetails) || accountID === -1 || !avatarURL ? (
                                    <AvatarSkeleton size={CONST.AVATAR_SIZE.XLARGE} />
                                ) : (
                                    <MenuItemGroup shouldUseSingleExecution={false}>
                                        <AvatarWithImagePicker
                                            isUsingDefaultAvatar={isDefaultAvatar(currentUserPersonalDetails?.avatar ?? '')}
                                            source={avatarURL}
                                            avatarID={accountID}
                                            onImageSelected={updateAvatar}
                                            onImageRemoved={deleteAvatar}
                                            size={CONST.AVATAR_SIZE.XLARGE}
                                            avatarStyle={[styles.avatarXLarge, styles.alignSelfStart]}
                                            pendingAction={currentUserPersonalDetails?.pendingFields?.avatar ?? undefined}
                                            errors={currentUserPersonalDetails?.errorFields?.avatar ?? null}
                                            errorRowStyles={styles.mt6}
                                            onErrorClose={clearAvatarErrors}
                                            onViewPhotoPress={() => Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(accountID))}
                                            previewSource={getFullSizeAvatar(avatarURL, accountID)}
                                            originalFileName={currentUserPersonalDetails.originalFileName}
                                            headerTitle={translate('profilePage.profileAvatar')}
                                            fallbackIcon={currentUserPersonalDetails?.fallbackIcon}
                                            editIconStyle={styles.profilePageAvatar}
                                        />
                                    </MenuItemGroup>
                                )}
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
                            <Button
                                accessibilityLabel={translate('common.shareCode')}
                                text={translate('common.share')}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_SHARE_CODE)}
                                icon={Expensicons.QrCode}
                                style={[styles.alignSelfStart, styles.mt6]}
                            />
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
                                <MenuItemGroup shouldUseSingleExecution={!isActingAsDelegate}>
                                    {privateOptions.map((detail, index) => (
                                        <MenuItemWithTopDescription
                                            // eslint-disable-next-line react/no-array-index-key
                                            key={`${detail.title}_${index}`}
                                            shouldShowRightIcon
                                            title={detail.title}
                                            description={detail.description}
                                            wrapperStyle={styles.sectionMenuItemTopDescription}
                                            onPress={detail.action}
                                            brickRoadIndicator={detail.brickRoadIndicator}
                                        />
                                    ))}
                                </MenuItemGroup>
                            )}
                        </Section>
                    </View>
                </MenuItemGroup>
            </ScrollView>
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </ScreenWrapper>
    );
}

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
