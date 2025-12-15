import {adminAccountIDsSelector} from '@selectors/Domain';
import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
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
import type {PersonalDetails} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainAdminDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMIN_DETAILS>;

function DomainAdminDetailsPage({route}: DomainAdminDetailsPageProps) {
    const domainAccountID = route.params.domainAccountID;
    const accountID = route.params.accountID;
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();

    const [adminAccountIDs, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const displayName = formatPhoneNumber(getDisplayNameOrDefault(details));
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const isSMSLogin = Str.isSMSLogin(memberLogin);
    const phoneNumber = getPhoneNumber(details);
    const fallbackIcon = details.fallbackIcon ?? '';

    const currentUserAccountID = getCurrentUserAccountID();
    const isAdmin = adminAccountIDs?.includes(currentUserAccountID);

    if (isLoadingOnyxValue(domainMetadata)) {
        return <FullScreenLoadingIndicator />;
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
                            <OfflineWithFeedback pendingAction={details.pendingFields?.avatar}>
                                <Avatar
                                    containerStyles={[styles.avatarXLarge, styles.mb4, styles.noOutline]}
                                    imageStyles={[styles.avatarXLarge]}
                                    source={details.avatar}
                                    avatarID={accountID}
                                    type={CONST.ICON_TYPE_AVATAR}
                                    size={CONST.AVATAR_SIZE.X_LARGE}
                                    fallbackIcon={fallbackIcon}
                                />
                            </OfflineWithFeedback>
                            {!!(details.displayName ?? '') && (
                                <Text
                                    style={[styles.textHeadline, styles.pre, styles.mb8, styles.w100, styles.textAlignCenter]}
                                    numberOfLines={1}
                                >
                                    {displayName}
                                </Text>
                            )}
                            <View style={styles.w100}>
                                <MenuItemWithTopDescription
                                    title={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                                    copyValue={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                                    description={translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                    interactive={false}
                                    copyable
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

DomainAdminDetailsPage.displayName = 'DomainAdminDetailsPage';

export default DomainAdminDetailsPage;
