import {adminAccountIDsSelector} from '@selectors/Domain';
import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import DecisionModal from '@components/DecisionModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault, getPhoneNumber} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {getCurrentUserAccountID} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainMemberDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

function DomainMemberDetailsPage({route}: DomainMemberDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Info', 'RemoveMembers'] as const);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [adminAccountIDs, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });

    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[accountID],
    });

    const displayName = formatPhoneNumber(getDisplayNameOrDefault(personalDetails));
    const memberLogin = personalDetails?.login ?? '';
    const isSMSLogin = Str.isSMSLogin(memberLogin);
    const phoneNumber = getPhoneNumber(personalDetails);
    const fallbackIcon = personalDetails?.fallbackIcon ?? '';

    const currentUserAccountID = getCurrentUserAccountID();
    const isAdmin = adminAccountIDs?.includes(currentUserAccountID);

    if (isLoadingOnyxValue(domainMetadata)) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    const handleForceCloseAccount = () => {
        console.log('force closing');
        setIsModalVisible(false);
        Navigation.dismissModal();
    };

    const handleSafeCloseAccount = () => {
        console.log('safe closing');
        setIsModalVisible(false);
        Navigation.dismissModal();
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID={DomainMemberDetailsPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.route)}
                shouldForceFullScreen
            >
                <HeaderWithBackButton title={displayName} />
                <ScrollView addBottomSafeAreaPadding>
                    <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                        <View style={[styles.avatarSectionWrapper, styles.pb0]}>
                            <OfflineWithFeedback pendingAction={personalDetails?.pendingFields?.avatar}>
                                <Avatar
                                    containerStyles={[styles.avatarXLarge, styles.mb4, styles.noOutline]}
                                    imageStyles={styles.avatarXLarge}
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
                            <Button
                                text={translate('domain.members.closeAccount')}
                                onPress={() => setIsModalVisible(true)}
                                // isDisabled={isAdmin}
                                icon={icons.RemoveMembers}
                                style={styles.mb5}
                            />
                        </View>
                        <View style={styles.w100}>
                            <MenuItemWithTopDescription
                                title={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                                copyValue={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                                description={translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                interactive={false}
                                copyable
                            />
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
            <DecisionModal
                title={translate('domain.members.closeAccount')}
                prompt={translate('domain.members.closeAccountInfo')}
                isSmallScreenWidth={false}
                onSecondOptionSubmit={handleSafeCloseAccount}
                secondOptionText={translate('domain.members.safeCloseAccount')}
                firstOptionText={translate('domain.members.forceCloseAccount')}
                isVisible={isModalVisible}
                onClose={handleForceCloseAccount}
                firstOptionDanger
                secondOptionSuccess
            />
        </ScreenWrapper>
    );
}

DomainMemberDetailsPage.displayName = 'DomainAdminDetailsPage';

export default DomainMemberDetailsPage;
