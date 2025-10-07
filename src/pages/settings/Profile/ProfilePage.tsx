import {useRoute} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {View} from 'react-native';
import AvatarSkeleton from '@components/AvatarSkeleton';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import Button from '@components/Button';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemGroup from '@components/MenuItemGroup';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
    const {translate, formatPhoneNumber} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const scrollEnabled = useScrollEnabled();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: false});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const route = useRoute<PlatformStackRouteProp<SettingsSplitNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.ROOT>>();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: false});

    // SecureStore test state
    const [testKey, setTestKey] = useState('');
    const [testValue, setTestValue] = useState('');
    const [secureStoreResult, setSecureStoreResult] = useState('');
    const [secureStoreError, setSecureStoreError] = useState('');
    const getPronouns = (): string => {
        const pronounsKey = currentUserPersonalDetails?.pronouns?.replace(CONST.PRONOUNS.PREFIX, '') ?? '';
        return pronounsKey ? translate(`pronouns.${pronounsKey}` as TranslationPaths) : translate('profilePage.selectYourPronouns');
    };

    const avatarURL = currentUserPersonalDetails?.avatar ?? '';
    const accountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;

    const contactMethodBrickRoadIndicator = getLoginListBrickRoadIndicator(loginList, currentUserPersonalDetails?.email);
    const emojiCode = currentUserPersonalDetails?.status?.emojiCode ?? '';
    const privateDetails = privatePersonalDetails ?? {};
    const legalName = `${privateDetails.legalFirstName ?? ''} ${privateDetails.legalLastName ?? ''}`.trim();

    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {canBeMissing: true});
    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const handleSetSecureStore = () => {
        try {
            setSecureStoreError('');
            setSecureStoreResult('');

            console.log('[ProfilePage] handleSetSecureStore called');
            console.log('[ProfilePage] window.electron exists:', !!window.electron);
            console.log('[ProfilePage] window.electron.secureStore exists:', !!(window.electron as any)?.secureStore);

            if (!testKey || !testValue) {
                setSecureStoreError('Key and value are required');
                return;
            }

            // @ts-expect-error - SecureStore is available only in Electron/desktop
            if (window.electron?.secureStore) {
                console.log(`[ProfilePage] Calling secureStore.set(${testKey}, ${testValue})`);
                // @ts-expect-error - SecureStore typing
                window.electron.secureStore.set(testKey, testValue);
                setSecureStoreResult(`✓ Successfully stored: ${testKey} = ${testValue}`);
                console.log('[ProfilePage] SET completed successfully');
            } else {
                const errorMsg = 'SecureStore is only available in Electron desktop app';
                console.error('[ProfilePage]', errorMsg);
                setSecureStoreError(errorMsg);
            }
        } catch (error) {
            const errorMsg = `Error: ${error instanceof Error ? error.message : String(error)}`;
            console.error('[ProfilePage] SET error:', error);
            setSecureStoreError(errorMsg);
        }
    };

    const handleGetSecureStore = () => {
        try {
            setSecureStoreError('');
            setSecureStoreResult('');

            console.log('[ProfilePage] handleGetSecureStore called');

            if (!testKey) {
                setSecureStoreError('Key is required');
                return;
            }

            // @ts-expect-error - SecureStore is available only in Electron/desktop
            if (window.electron?.secureStore) {
                console.log(`[ProfilePage] Calling secureStore.get(${testKey})`);
                // @ts-expect-error - SecureStore typing
                const value = window.electron.secureStore.get(testKey);
                console.log(`[ProfilePage] GET returned:`, value);
                if (value === null) {
                    setSecureStoreResult(`Key "${testKey}" not found`);
                } else {
                    setSecureStoreResult(`✓ Retrieved: ${testKey} = ${value}`);
                }
            } else {
                const errorMsg = 'SecureStore is only available in Electron desktop app';
                console.error('[ProfilePage]', errorMsg);
                setSecureStoreError(errorMsg);
            }
        } catch (error) {
            const errorMsg = `Error: ${error instanceof Error ? error.message : String(error)}`;
            console.error('[ProfilePage] GET error:', error);
            setSecureStoreError(errorMsg);
        }
    };

    const handleDeleteSecureStore = () => {
        try {
            setSecureStoreError('');
            setSecureStoreResult('');

            console.log('[ProfilePage] handleDeleteSecureStore called');

            if (!testKey) {
                setSecureStoreError('Key is required');
                return;
            }

            // @ts-expect-error - SecureStore is available only in Electron/desktop
            if (window.electron?.secureStore) {
                console.log(`[ProfilePage] Calling secureStore.delete(${testKey})`);
                // @ts-expect-error - SecureStore typing
                window.electron.secureStore.delete(testKey);
                setSecureStoreResult(`✓ Deleted key: ${testKey}`);
                console.log('[ProfilePage] DELETE completed successfully');
            } else {
                const errorMsg = 'SecureStore is only available in Electron desktop app';
                console.error('[ProfilePage]', errorMsg);
                setSecureStoreError(errorMsg);
            }
        } catch (error) {
            const errorMsg = `Error: ${error instanceof Error ? error.message : String(error)}`;
            console.error('[ProfilePage] DELETE error:', error);
            setSecureStoreError(errorMsg);
        }
    };
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
            testID={ProfilePage.displayName}
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
                                    <AvatarSkeleton size={CONST.AVATAR_SIZE.X_LARGE} />
                                ) : (
                                    <MenuItemGroup shouldUseSingleExecution={false}>
                                        <AvatarWithImagePicker
                                            isUsingDefaultAvatar={isDefaultAvatar(currentUserPersonalDetails?.avatar ?? '')}
                                            source={avatarURL}
                                            avatarID={accountID}
                                            onImageSelected={(file) => {
                                                updateAvatar(file, {
                                                    avatar: currentUserPersonalDetails?.avatar,
                                                    avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                                                    accountID: currentUserPersonalDetails?.accountID,
                                                });
                                            }}
                                            onImageRemoved={() => {
                                                deleteAvatar({
                                                    avatar: currentUserPersonalDetails?.avatar,
                                                    fallbackIcon: currentUserPersonalDetails?.fallbackIcon,
                                                    accountID: currentUserPersonalDetails?.accountID,
                                                });
                                            }}
                                            size={CONST.AVATAR_SIZE.X_LARGE}
                                            avatarStyle={[styles.avatarXLarge, styles.alignSelfStart]}
                                            pendingAction={currentUserPersonalDetails?.pendingFields?.avatar ?? undefined}
                                            errors={currentUserPersonalDetails?.errorFields?.avatar ?? null}
                                            errorRowStyles={styles.mt6}
                                            onErrorClose={() => clearAvatarErrors(currentUserPersonalDetails?.accountID)}
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

                        <Section
                            title="SecureStore Test (Desktop Only)"
                            subtitle="Test native Swift SecureStore addon"
                            isCentralPane
                            subtitleMuted
                            childrenStyles={styles.pt3}
                            titleStyles={styles.accountSettingsSectionTitle}
                        >
                            <View style={[styles.mb4]}>
                                <TextInput
                                    label="Key"
                                    placeholder="Enter key"
                                    value={testKey}
                                    onChangeText={setTestKey}
                                    containerStyles={[styles.mb4]}
                                />
                                <TextInput
                                    label="Value"
                                    placeholder="Enter value"
                                    value={testValue}
                                    onChangeText={setTestValue}
                                    containerStyles={[styles.mb4]}
                                />
                                <View style={[styles.flexRow, styles.gap2, styles.mb4]}>
                                    <Button
                                        text="Set"
                                        onPress={handleSetSecureStore}
                                        style={[styles.flex1]}
                                        small
                                    />
                                    <Button
                                        text="Get"
                                        onPress={handleGetSecureStore}
                                        style={[styles.flex1]}
                                        small
                                    />
                                    <Button
                                        text="Delete"
                                        onPress={handleDeleteSecureStore}
                                        style={[styles.flex1]}
                                        small
                                    />
                                </View>
                                {secureStoreResult ? (
                                    <View style={[styles.p4, styles.mb4, StyleUtils.getBackgroundColorStyle(theme.success)]}>
                                        <Text style={[styles.textWhite]}>{secureStoreResult}</Text>
                                    </View>
                                ) : null}
                                {secureStoreError ? (
                                    <View style={[styles.p4, styles.mb4, StyleUtils.getBackgroundColorStyle(theme.danger)]}>
                                        <Text style={[styles.textWhite]}>{secureStoreError}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </Section>
                    </View>
                </MenuItemGroup>
            </ScrollView>
        </ScreenWrapper>
    );
}

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
