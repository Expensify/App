import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {removeFromGroupChat} from '@libs/actions/Report';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {isGroupChatAdmin} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import type {ParticipantsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails} from '@src/types/onyx';
import NotFoundPage from './ErrorPage/NotFoundPage';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

type DynamicReportParticipantDetailsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DYNAMIC_DETAILS>;

function DynamicReportParticipantDetails({report, route}: DynamicReportParticipantDetailsPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['RemoveMembers', 'Info']);
    const isInLandscapeMode = useIsInLandscapeMode();
    const styles = useThemeStyles();
    const {formatPhoneNumber, translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [isRemoveMemberConfirmModalVisible, setIsRemoveMemberConfirmModalVisible] = React.useState(false);

    const accountID = Number(route.params.accountID);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_PARTICIPANTS_DETAILS.path);

    const member = report?.participants?.[accountID];
    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const fallbackIcon = details.fallbackIcon ?? '';
    const displayName = formatPhoneNumber(getDisplayNameOrDefault(details));
    const isCurrentUserAdmin = isGroupChatAdmin(report, currentUserPersonalDetails?.accountID);
    const isSelectedMemberCurrentUser = accountID === currentUserPersonalDetails?.accountID;
    const removeUser = () => {
        setIsRemoveMemberConfirmModalVisible(false);
        removeFromGroupChat(report, [accountID]);
        Navigation.goBack(backPath);
    };

    const navigateToProfile = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(accountID)));
    };

    const openRoleSelectionModal = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_PARTICIPANTS_ROLE.path));
    };

    if (!member) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID="DynamicReportParticipantDetails">
            <HeaderWithBackButton
                title={displayName}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <ScrollView contentContainerStyle={[!isInLandscapeMode && [styles.containerWithSpaceBetween, styles.justifyContentStart], styles.pointerEventsBoxNone]}>
                <View style={[styles.avatarSectionWrapper, styles.pb0]}>
                    <Avatar
                        containerStyles={[styles.avatarXxxxxLarge, styles.mv5, styles.noOutline]}
                        imageStyles={[styles.avatarXxxxxLarge]}
                        source={details.avatar}
                        avatarID={accountID}
                        type={CONST.ICON_TYPE_AVATAR}
                        size={CONST.AVATAR_SIZE.XXXXX_LARGE}
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
                        <>
                            <Button
                                text={translate('workspace.people.removeGroupMemberButtonTitle')}
                                onPress={() => setIsRemoveMemberConfirmModalVisible(true)}
                                isDisabled={isSelectedMemberCurrentUser}
                                icon={icons.RemoveMembers}
                                iconStyles={StyleUtils.getTransformScaleStyle(0.8)}
                                style={styles.mv5}
                            />
                            <ConfirmModal
                                danger
                                title={translate('workspace.people.removeGroupMemberButtonTitle')}
                                isVisible={isRemoveMemberConfirmModalVisible}
                                onConfirm={removeUser}
                                onCancel={() => setIsRemoveMemberConfirmModalVisible(false)}
                                prompt={translate('workspace.people.removeMemberPrompt', displayName)}
                                confirmText={translate('common.remove')}
                                cancelText={translate('common.cancel')}
                            />
                        </>
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
            </ScrollView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicReportParticipantDetails);
