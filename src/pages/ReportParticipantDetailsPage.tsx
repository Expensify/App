import React, {useCallback} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {removeFromGroupChat} from '@libs/actions/Report';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {isGroupChatAdmin} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import type {ParticipantsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails} from '@src/types/onyx';
import NotFoundPage from './ErrorPage/NotFoundPage';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';

type ReportParticipantDetailsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DETAILS>;

function ReportParticipantDetails({report, route}: ReportParticipantDetailsPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['RemoveMembers', 'Info']);
    const styles = useThemeStyles();
    const {formatPhoneNumber, translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const StyleUtils = useStyleUtils();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const accountID = Number(route.params.accountID);
    const backTo = ROUTES.REPORT_PARTICIPANTS.getRoute(report?.reportID, route.params.backTo);

    const member = report?.participants?.[accountID];
    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const fallbackIcon = details.fallbackIcon ?? '';
    const displayName = formatPhoneNumber(getDisplayNameOrDefault(details));
    const isCurrentUserAdmin = isGroupChatAdmin(report, currentUserPersonalDetails?.accountID);
    const isSelectedMemberCurrentUser = accountID === currentUserPersonalDetails?.accountID;

    const handleRemoveUser = useCallback(() => {
        showConfirmModal({
            danger: true,
            title: translate('workspace.people.removeGroupMemberButtonTitle'),
            prompt: translate('workspace.people.removeMemberPrompt', {memberName: displayName}),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            removeFromGroupChat(report?.reportID, [accountID]);
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.goBack(backTo);
            });
        });
    }, [showConfirmModal, translate, displayName, report.reportID, accountID, backTo]);

    const navigateToProfile = () => {
        Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute()));
    };

    const openRoleSelectionModal = () => {
        Navigation.navigate(ROUTES.REPORT_PARTICIPANTS_ROLE_SELECTION.getRoute(report.reportID, accountID, route.params.backTo));
    };

    if (!member) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID="ReportParticipantDetails">
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
                    {!!(displayName ?? '') && (
                        <Text
                            style={[styles.textHeadline, styles.pre, styles.mb6, styles.w100, styles.textAlignCenter]}
                            numberOfLines={1}
                        >
                            {displayName}
                        </Text>
                    )}
                    {isCurrentUserAdmin && (
                        <Button
                            text={translate('workspace.people.removeGroupMemberButtonTitle')}
                            onPress={handleRemoveUser}
                            isDisabled={isSelectedMemberCurrentUser}
                            icon={icons.RemoveMembers}
                            iconStyles={StyleUtils.getTransformScaleStyle(0.8)}
                            style={styles.mv5}
                        />
                    )}
                </View>
                <View style={styles.w100}>
                    {isCurrentUserAdmin && (
                        <OfflineWithFeedback pendingAction={member?.pendingFields?.role ?? null}>
                            <MenuItemWithTopDescription
                                disabled={isSelectedMemberCurrentUser}
                                title={member?.role === CONST.REPORT.ROLE.ADMIN ? translate('common.admin') : translate('common.member')}
                                description={translate('common.role')}
                                shouldShowRightIcon
                                onPress={openRoleSelectionModal}
                            />
                        </OfflineWithFeedback>
                    )}
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

export default withReportOrNotFound()(ReportParticipantDetails);
