import React, {useCallback} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {removeFromRoom} from '@libs/actions/Report';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RoomMembersNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {isUserPolicyAdmin} from '@libs/PolicyUtils';
import {isPolicyExpenseChat} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails} from '@src/types/onyx';
import NotFoundPage from './ErrorPage/NotFoundPage';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';

type RoomMemberDetailsPagePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.DETAILS>;

function RoomMemberDetailsPage({report, route}: RoomMemberDetailsPagePageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['RemoveMembers', 'Info']);
    const styles = useThemeStyles();
    const {formatPhoneNumber, translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const policy = usePolicy(report?.policyID);

    const [isRemoveMemberConfirmModalVisible, setIsRemoveMemberConfirmModalVisible] = React.useState(false);

    const accountID = Number(route.params.accountID);
    const backTo = ROUTES.ROOM_MEMBERS.getRoute(report?.reportID, route.params.backTo);

    const member = report?.participants?.[accountID];
    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const fallbackIcon = details.fallbackIcon ?? '';
    const displayName = formatPhoneNumber(getDisplayNameOrDefault(details));
    const isSelectedMemberCurrentUser = accountID === currentUserPersonalDetails?.accountID;
    const isSelectedMemberOwner = accountID === report.ownerAccountID;
    const shouldDisableRemoveUser = (isPolicyExpenseChat(report) && isUserPolicyAdmin(policy, details.login)) || isSelectedMemberCurrentUser || isSelectedMemberOwner;
    const removeUser = useCallback(() => {
        setIsRemoveMemberConfirmModalVisible(false);
        removeFromRoom(report?.reportID, [accountID]);
        Navigation.goBack(backTo);
    }, [backTo, report?.reportID, accountID]);

    const navigateToProfile = useCallback(() => {
        Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute()));
    }, [accountID]);

    if (!member) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID="RoomMemberDetailsPage">
            <HeaderWithBackButton
                title={displayName}
                onBackButtonPress={() => Navigation.goBack(backTo)}
            />
            <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                <View style={[styles.avatarSectionWrapper, styles.pb0]}>
                    <Avatar
                        containerStyles={[styles.avatarXLarge, styles.mv5, styles.noOutline]}
                        imageStyles={[styles.avatarXLarge]}
                        source={details.avatar}
                        avatarID={accountID}
                        type={CONST.ICON_TYPE_AVATAR}
                        size={CONST.AVATAR_SIZE.X_LARGE}
                        fallbackIcon={fallbackIcon}
                    />
                    {!!(details.displayName ?? '') && (
                        <Text
                            style={[styles.textHeadline, styles.pre, styles.mb6, styles.w100, styles.textAlignCenter]}
                            numberOfLines={1}
                        >
                            {displayName}
                        </Text>
                    )}
                    <>
                        <Button
                            text={translate('workspace.people.removeRoomMemberButtonTitle')}
                            onPress={() => setIsRemoveMemberConfirmModalVisible(true)}
                            isDisabled={shouldDisableRemoveUser}
                            icon={icons.RemoveMembers}
                            iconStyles={StyleUtils.getTransformScaleStyle(0.8)}
                            style={styles.mv5}
                        />
                        <ConfirmModal
                            danger
                            title={translate('workspace.people.removeRoomMemberButtonTitle')}
                            isVisible={isRemoveMemberConfirmModalVisible}
                            onConfirm={removeUser}
                            onCancel={() => setIsRemoveMemberConfirmModalVisible(false)}
                            prompt={translate('workspace.people.removeMemberPrompt', {memberName: displayName})}
                            confirmText={translate('common.remove')}
                            cancelText={translate('common.cancel')}
                        />
                    </>
                </View>
                <View style={styles.w100}>
                    <MenuItem
                        title={translate('common.profile')}
                        icon={icons.Info}
                        onPress={navigateToProfile}
                        shouldShowRightIcon
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(RoomMemberDetailsPage);
