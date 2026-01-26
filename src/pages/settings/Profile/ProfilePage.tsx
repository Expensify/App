import {useRoute} from '@react-navigation/native';
import React, {useContext, useMemo} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import AvatarSkeleton from '@components/AvatarSkeleton';
import Button from '@components/Button';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import MenuItemGroup from '@components/MenuItemGroup';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyAsset, useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault, getFormattedAddress} from '@libs/PersonalDetailsUtils';
import {getContactMethodsOptions, getLoginListBrickRoadIndicator} from '@libs/UserUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function ProfilePage() {
    const icons = useMemoizedLazyExpensifyIcons(['QrCode'] as const);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const scrollEnabled = useScrollEnabled();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: false});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const route = useRoute<PlatformStackRouteProp<SettingsSplitNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.ROOT>>();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: false});
    const getPronouns = (): string => {
        const pronounsKey = currentUserPersonalDetails?.pronouns?.replace(CONST.PRONOUNS.PREFIX, '') ?? '';
        return pronounsKey ? translate(`pronouns.${pronounsKey}` as TranslationPaths) : translate('profilePage.selectYourPronouns');
    };
    const logins = useMemo(() => getContactMethodsOptions(translate, loginList, session?.email), [loginList, session?.email, translate]);

    const avatarURL = currentUserPersonalDetails?.avatar ?? '';
    const accountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const avatarStyle = [styles.avatarXLarge, styles.alignSelfStart];
    const {asset: Profile} = useMemoizedLazyAsset(() => loadIllustration('Profile' as IllustrationName));

    const contactMethodBrickRoadIndicator = getLoginListBrickRoadIndicator(loginList, currentUserPersonalDetails?.email);
    const emojiCode = currentUserPersonalDetails?.status?.emojiCode ?? '';
    const privateDetails = privatePersonalDetails ?? {};
    const legalName = `${privateDetails.legalFirstName ?? ''} ${privateDetails.legalLastName ?? ''}`.trim();

    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {canBeMissing: true});
    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const publicOptions = [
        {
            description: translate('displayNamePage.headerTitle'),
            title: formatPhoneNumber(getDisplayNameOrDefault(currentUserPersonalDetails)),
            pageRoute: ROUTES.SETTINGS_DISPLAY_NAME,
        },
        {
            description: translate('contacts.contactMethods'),
            title: logins
                .map((login) => login?.menuItemTitle)
                .filter(Boolean)
                .join(', '),
            pageRoute: ROUTES.SETTINGS_CONTACT_METHODS.route,
            brickRoadIndicator: contactMethodBrickRoadIndicator,
            testID: 'contact-method-menu-item',
        },
        {
            description: translate('statusPage.status'),
            title: emojiCode ? `${emojiCode} ${currentUserPersonalDetails?.status?.text ?? ''}` : '',
            pageRoute: ROUTES.SETTINGS_STATUS,
            brickRoadIndicator: isEmptyObject(vacationDelegate?.errors) ? undefined : CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
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
                    showDelegateNoAccessModal();
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
                    showDelegateNoAccessModal();
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
                    showDelegateNoAccessModal();
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
                    showDelegateNoAccessModal();
                    return;
                }
                Navigation.navigate(ROUTES.SETTINGS_ADDRESS);
            },
        },
    ];

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="ProfilePage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('common.profile')}
                onBackButtonPress={() => {
                    if (Navigation.getShouldPopToSidebar()) {
                        Navigation.popToSidebar();
                        return;
                    }
                    Navigation.goBack(route.params?.backTo);
                }}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                icon={Profile}
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
                                    <AvatarSkeleton size={CONST.AVATAR_SIZE.X_LARGE} />
                                ) : (
                                    <MenuItemGroup shouldUseSingleExecution={false}>
                                        <AvatarButtonWithIcon
                                            text={translate('avatarWithImagePicker.editImage')}
                                            source={avatarURL}
                                            avatarID={accountID}
                                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_AVATAR)}
                                            size={CONST.AVATAR_SIZE.X_LARGE}
                                            avatarStyle={avatarStyle}
                                            pendingAction={currentUserPersonalDetails?.pendingFields?.avatar ?? undefined}
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
                                    pressableTestID={detail?.testID}
                                />
                            ))}
                            <Button
                                accessibilityLabel={translate('common.shareCode')}
                                text={translate('common.share')}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_SHARE_CODE)}
                                icon={icons.QrCode}
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
                                <View style={[styles.flex1, styles.pRelative, StyleUtils.getBackgroundColorStyle(theme.cardBG)]}>
                                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                                </View>
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
        </ScreenWrapper>
    );
}

export default ProfilePage;
