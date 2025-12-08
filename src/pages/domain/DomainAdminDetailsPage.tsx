import React from 'react';
import { View } from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import {Str} from 'expensify-common';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import type SCREENS from '@src/SCREENS';
import phoneNumber from '@pages/MissingPersonalDetails/substeps/PhoneNumber';

type DomainAdminDetailsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.ADMIN_DETAILS>;


function DomainAdminDetailsPage({route}: DomainAdminDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const icons = useMemoizedLazyExpensifyIcons(['RemoveMembers'] as const);


    const accountID = Number(route.params.accountID);
    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const displayName = formatPhoneNumber(getDisplayNameOrDefault(details));

    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const isSMSLogin = Str.isSMSLogin(memberLogin);

    return (
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={DomainAdminDetailsPage.displayName}
            >
                <HeaderWithBackButton
                    title={displayName}
                />
                <ScrollView addBottomSafeAreaPadding>
                    <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                        <View style={[styles.avatarSectionWrapper, styles.pb0]}>
                            <OfflineWithFeedback pendingAction={details.pendingFields?.avatar}>
                                <Avatar
                                    containerStyles={[styles.avatarXLarge, styles.mb4, styles.noOutline]}
                                    imageStyles={[styles.avatarXLarge]}
                                    source={details.avatar}
                                    avatarID={route.params.accountID}
                                    type={CONST.ICON_TYPE_AVATAR}
                                    size={CONST.AVATAR_SIZE.X_LARGE}
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
                            <Button
                                text={translate('workspace.people.removeWorkspaceMemberButtonTitle')}
                                onPress={() => {}}
                                isDisabled={false}
                                icon={icons.RemoveMembers}
                                style={styles.mb5}
                            />
                            <View style={styles.w100}>
                                <MenuItemWithTopDescription
                                    title={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                                    copyValue={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                                    description={translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                    interactive={false}
                                    copyable
                                />
                            </View>
                            <ConfirmModal
                                danger
                                title={translate('workspace.people.removeMemberTitle')}
                                isVisible={false}
                                onConfirm={() => {}}
                                onCancel={() => {}}
                                confirmText={translate('common.remove')}
                                cancelText={translate('common.cancel')}
                            />
                        </View>
                    </View>
                </ScrollView>
            </ScreenWrapper>
    );
}

DomainAdminDetailsPage.displayName = 'DomainAdminDetailsPage';

export default DomainAdminDetailsPage;
