import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@libs/actions/Report';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import Navigation from '@navigation/Navigation';
import type {ParticipantsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';

type ReportParticipantDetailsOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type ReportParticipantDetailsPageProps = WithReportOrNotFoundProps &
    StackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DETAILS> &
    ReportParticipantDetailsOnyxProps;

function ReportParticipantDetails({personalDetails, report, route}: ReportParticipantDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [isRemoveMemberConfirmModalVisible, setIsRemoveMemberConfirmModalVisible] = React.useState(false);

    const accountID = Number(route.params.accountID);
    const backTo = ROUTES.REPORT_PARTICIPANTS.getRoute(report?.reportID ?? '');

    const member = report?.participants?.[accountID];
    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const avatar = details.avatar ?? UserUtils.getDefaultAvatar();
    const fallbackIcon = details.fallbackIcon ?? '';
    const displayName = details.displayName ?? '';
    const isCurrentUserAdmin = ReportUtils.isGroupChatAdmin(report, currentUserPersonalDetails?.accountID);
    const isSelectedMemberCurrentUser = accountID === currentUserPersonalDetails?.accountID;
    const removeUser = useCallback(() => {
        setIsRemoveMemberConfirmModalVisible(false);
        Report.removeFromGroupChat(report?.reportID, [accountID]);
        Navigation.goBack(backTo);
    }, [backTo, report, accountID]);

    const navigateToProfile = useCallback(() => {
        Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute()));
    }, [accountID]);

    const openRoleSelectionModal = useCallback(() => {
        Navigation.navigate(ROUTES.REPORT_PARTICIPANTS_ROLE_SELECTION.getRoute(report.reportID, accountID));
    }, [accountID, report.reportID]);

    return (
        <ScreenWrapper testID={ReportParticipantDetails.displayName}>
            <HeaderWithBackButton
                title={displayName}
                onBackButtonPress={() => Navigation.goBack(backTo)}
            />
            <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                <View style={[styles.avatarSectionWrapper, styles.pb0]}>
                    <Avatar
                        containerStyles={[styles.avatarXLarge, styles.mv5, styles.noOutline]}
                        imageStyles={[styles.avatarXLarge]}
                        source={UserUtils.getAvatar(avatar, accountID)}
                        size={CONST.AVATAR_SIZE.XLARGE}
                        fallbackIcon={fallbackIcon}
                    />
                    {Boolean(details.displayName ?? '') && (
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
                                text={translate('workspace.people.removeMemberGroupButtonTitle')}
                                onPress={() => setIsRemoveMemberConfirmModalVisible(true)}
                                medium
                                isDisabled={isSelectedMemberCurrentUser}
                                icon={Expensicons.RemoveMembers}
                                iconStyles={StyleUtils.getTransformScaleStyle(0.8)}
                                style={styles.mv5}
                            />
                            <ConfirmModal
                                danger
                                title={translate('workspace.people.removeMemberGroupButtonTitle')}
                                isVisible={isRemoveMemberConfirmModalVisible}
                                onConfirm={removeUser}
                                onCancel={() => setIsRemoveMemberConfirmModalVisible(false)}
                                prompt={translate('workspace.people.removeMemberPrompt', {memberName: displayName})}
                                confirmText={translate('common.remove')}
                                cancelText={translate('common.cancel')}
                            />
                        </>
                    )}
                </View>
                <View style={styles.w100}>
                    {isCurrentUserAdmin && (
                        <MenuItemWithTopDescription
                            disabled={isSelectedMemberCurrentUser}
                            title={member?.role === CONST.REPORT.ROLE.ADMIN ? translate('common.admin') : translate('common.member')}
                            description={translate('common.role')}
                            shouldShowRightIcon
                            onPress={openRoleSelectionModal}
                        />
                    )}
                    <MenuItem
                        title={translate('common.profile')}
                        icon={Expensicons.Info}
                        onPress={navigateToProfile}
                        shouldShowRightIcon
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

ReportParticipantDetails.displayName = 'ReportParticipantDetails';

export default withReportOrNotFound()(
    withOnyx<ReportParticipantDetailsPageProps, ReportParticipantDetailsOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    })(ReportParticipantDetails),
);
