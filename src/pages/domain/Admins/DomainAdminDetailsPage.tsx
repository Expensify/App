import {adminAccountIDsSelector} from '@selectors/Domain';
import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {revokeDomainAdminAccess} from '@libs/actions/Domain';
import {getDisplayNameOrDefault, getPhoneNumber} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {getCurrentUserAccountID} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {domainSettingsPrimaryContactSelector} from '@src/selectors/Domain';
import type {PersonalDetailsList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainAdminDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMIN_DETAILS>;

function DomainAdminDetailsPage({route}: DomainAdminDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Info', 'ClosedSign'] as const);

    const [adminAccountIDs, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });

    const [primaryContact] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        selector: domainSettingsPrimaryContactSelector,
        canBeMissing: false,
    });

    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[accountID],
    });

    const displayName = formatPhoneNumber(getDisplayNameOrDefault(personalDetails));
    const memberLogin = personalDetails?.login ?? '';
    const isCurrentUserPrimaryContact = primaryContact === memberLogin;
    const isSMSLogin = Str.isSMSLogin(memberLogin);
    const phoneNumber = getPhoneNumber(personalDetails);
    const fallbackIcon = personalDetails?.fallbackIcon ?? '';

    const currentUserAccountID = getCurrentUserAccountID();
    const isAdmin = adminAccountIDs?.includes(currentUserAccountID);
    const domainHasOnlyOneAdmin = adminAccountIDs?.length === 1;

    const {showConfirmModal} = useConfirmModal();

    const handleRevokeAdminAccess = async () => {
        const confirmResult = await showConfirmModal({
            title: translate('domain.admins.revokeAdminAccess'),
            prompt: translate('workspace.people.removeMemberPrompt', {memberName: displayName}),
            shouldShowCancelButton: true,
            danger: true,
        });
        if (confirmResult.action !== ModalActions.CONFIRM) {
            return;
        }
        revokeDomainAdminAccess(route.params.domainAccountID, route.params.accountID);
        Navigation.dismissModal();
    };

    if (isLoadingOnyxValue(domainMetadata)) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID={DomainAdminDetailsPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.route)}
                shouldShow={!isAdmin}
                shouldForceFullScreen
            >
                <HeaderWithBackButton title={displayName} />
                <ScrollView addBottomSafeAreaPadding>
                    <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                        <View style={[styles.avatarSectionWrapper, styles.pb0]}>
                            <OfflineWithFeedback pendingAction={personalDetails?.pendingFields?.avatar}>
                                <Avatar
                                    containerStyles={[styles.avatarXLarge, styles.mb4, styles.noOutline]}
                                    imageStyles={[styles.avatarXLarge]}
                                    source={personalDetails?.avatar}
                                    avatarID={accountID}
                                    type={CONST.ICON_TYPE_AVATAR}
                                    size={CONST.AVATAR_SIZE.X_LARGE}
                                    fallbackIcon={fallbackIcon}
                                />
                            </OfflineWithFeedback>
                            {!!displayName && (
                                <Text
                                    style={[styles.textHeadline, styles.pre, styles.mb8, styles.w100, styles.textAlignCenter]}
                                    numberOfLines={1}
                                >
                                    {displayName}
                                </Text>
                            )}
                        </View>
                        <View style={styles.w100}>
                            <MenuItemWithTopDescription
                                title={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                                copyValue={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                                description={translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                interactive={false}
                                copyable
                            />
                            {!domainHasOnlyOneAdmin && (
                                <MenuItem
                                    disabled={isCurrentUserPrimaryContact}
                                    style={styles.mb5}
                                    title={translate('domain.admins.revokeAdminAccess')}
                                    icon={icons.ClosedSign}
                                    onPress={handleRevokeAdminAccess}
                                />
                            )}
                            <MenuItem
                                style={styles.mb5}
                                title={translate('common.profile')}
                                icon={icons.Info}
                                onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute()))}
                                shouldShowRightIcon
                            />
                        </View>
                    </View>
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

DomainAdminDetailsPage.displayName = 'DomainAdminDetailsPage';

export default DomainAdminDetailsPage;
