import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Member from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import type {ListItemType} from './WorkspaceMemberDetailsRoleSelectionModal';
import WorkspaceMemberDetailsRoleSelectionModal from './WorkspaceMemberDetailsRoleSelectionModal';

type WorkspacePolicyOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceMemberDetailsPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    WorkspacePolicyOnyxProps &
    StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS>;

function WorkspaceMemberDetailsPage({personalDetails, policy, route}: WorkspaceMemberDetailsPageProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [isRemoveMemberConfirmModalVisible, setIsRemoveMemberConfirmModalVisible] = useState(false);
    const [isRoleSelectionModalVisible, setIsRoleSelectionModalVisible] = useState(false);

    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;

    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];
    const prevMember = usePrevious(member);
    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const fallbackIcon = details.fallbackIcon ?? '';
    const displayName = details.displayName ?? '';
    const isSelectedMemberOwner = policy?.owner === details.login;
    const isSelectedMemberCurrentUser = accountID === currentUserPersonalDetails?.accountID;
    const isCurrentUserAdmin = policy?.employeeList?.[personalDetails?.[currentUserPersonalDetails?.accountID]?.login ?? '']?.role === CONST.POLICY.ROLE.ADMIN;
    const isCurrentUserOwner = policy?.owner === currentUserPersonalDetails?.login;
    const ownerDetails = personalDetails?.[policy?.ownerAccountID ?? -1] ?? ({} as PersonalDetails);
    const policyOwnerDisplayName = ownerDetails.displayName ?? policy?.owner ?? '';

    const confirmModalPrompt = useMemo(() => {
        const isApprover = Member.isApprover(policy, accountID);
        if (!isApprover) {
            translate('workspace.people.removeMemberPrompt', {memberName: displayName});
        }
        return translate('workspace.people.removeMembersWarningPrompt', {memberName: displayName, ownerName: policyOwnerDisplayName});
    }, [accountID, policy, displayName, policyOwnerDisplayName, translate]);

    const roleItems: ListItemType[] = useMemo(
        () => [
            {
                value: CONST.POLICY.ROLE.ADMIN,
                text: translate('common.admin'),
                isSelected: member?.role === CONST.POLICY.ROLE.ADMIN,
                keyForList: CONST.POLICY.ROLE.ADMIN,
            },
            {
                value: CONST.POLICY.ROLE.USER,
                text: translate('common.member'),
                isSelected: member?.role !== CONST.POLICY.ROLE.ADMIN,
                keyForList: CONST.POLICY.ROLE.USER,
            },
        ],
        [member?.role, translate],
    );

    useEffect(() => {
        if (!prevMember || prevMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || member?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }
        Navigation.goBack();
    }, [member, prevMember]);

    const askForConfirmationToRemove = () => {
        setIsRemoveMemberConfirmModalVisible(true);
    };

    const removeUser = useCallback(() => {
        Member.removeMembers([accountID], policyID);
        setIsRemoveMemberConfirmModalVisible(false);
    }, [accountID, policyID]);

    const navigateToProfile = useCallback(() => {
        Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute()));
    }, [accountID]);

    const openRoleSelectionModal = useCallback(() => {
        setIsRoleSelectionModalVisible(true);
    }, []);

    const changeRole = useCallback(
        ({value}: ListItemType) => {
            setIsRoleSelectionModalVisible(false);
            Member.updateWorkspaceMembersRole(policyID, [accountID], value);
        },
        [accountID, policyID],
    );

    const startChangeOwnershipFlow = useCallback(() => {
        Member.clearWorkspaceOwnerChangeFlow(policyID);
        Member.requestWorkspaceOwnerChange(policyID);
        Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(policyID, accountID, 'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>));
    }, [accountID, policyID]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        !member || (member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && prevMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    if (shouldShowNotFoundPage) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper testID={WorkspaceMemberDetailsPage.displayName}>
                <HeaderWithBackButton
                    title={displayName}
                    subtitle={policy?.name}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                    <View style={[styles.avatarSectionWrapper, styles.pb0]}>
                        <OfflineWithFeedback pendingAction={details.pendingFields?.avatar}>
                            <Avatar
                                containerStyles={[styles.avatarXLarge, styles.mv5, styles.noOutline]}
                                imageStyles={[styles.avatarXLarge]}
                                source={details.avatar}
                                avatarID={accountID}
                                type={CONST.ICON_TYPE_AVATAR}
                                size={CONST.AVATAR_SIZE.XLARGE}
                                fallbackIcon={fallbackIcon}
                            />
                        </OfflineWithFeedback>
                        {!!(details.displayName ?? '') && (
                            <Text
                                style={[styles.textHeadline, styles.pre, styles.mb6, styles.w100, styles.textAlignCenter]}
                                numberOfLines={1}
                            >
                                {displayName}
                            </Text>
                        )}
                        {isSelectedMemberOwner && isCurrentUserAdmin && !isCurrentUserOwner ? (
                            <Button
                                text={translate('workspace.people.transferOwner')}
                                onPress={startChangeOwnershipFlow}
                                medium
                                isDisabled={isOffline}
                                icon={Expensicons.Transfer}
                                iconStyles={StyleUtils.getTransformScaleStyle(0.8)}
                                style={styles.mv5}
                            />
                        ) : (
                            <Button
                                text={translate('workspace.people.removeMemberButtonTitle')}
                                onPress={askForConfirmationToRemove}
                                medium
                                isDisabled={isSelectedMemberOwner || isSelectedMemberCurrentUser}
                                icon={Expensicons.RemoveMembers}
                                iconStyles={StyleUtils.getTransformScaleStyle(0.8)}
                                style={styles.mv5}
                            />
                        )}
                        <ConfirmModal
                            danger
                            title={translate('workspace.people.removeMemberTitle')}
                            isVisible={isRemoveMemberConfirmModalVisible}
                            onConfirm={removeUser}
                            onCancel={() => setIsRemoveMemberConfirmModalVisible(false)}
                            prompt={confirmModalPrompt}
                            confirmText={translate('common.remove')}
                            cancelText={translate('common.cancel')}
                        />
                    </View>
                    <View style={styles.w100}>
                        <MenuItemWithTopDescription
                            disabled={isSelectedMemberOwner || isSelectedMemberCurrentUser}
                            title={member?.role === CONST.POLICY.ROLE.ADMIN ? translate('common.admin') : translate('common.member')}
                            description={translate('common.role')}
                            shouldShowRightIcon
                            onPress={openRoleSelectionModal}
                        />
                        <MenuItem
                            title={translate('common.profile')}
                            icon={Expensicons.Info}
                            onPress={navigateToProfile}
                            shouldShowRightIcon
                        />
                        <WorkspaceMemberDetailsRoleSelectionModal
                            isVisible={isRoleSelectionModalVisible}
                            items={roleItems}
                            onRoleChange={changeRole}
                            onClose={() => setIsRoleSelectionModalVisible(false)}
                        />
                    </View>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceMemberDetailsPage.displayName = 'WorkspaceMemberDetailsPage';

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsPage);
