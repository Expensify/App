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
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as UserUtils from '@libs/UserUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Policy from '@userActions/Policy';
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
    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const avatar = details.avatar ?? UserUtils.getDefaultAvatar();
    const fallbackIcon = details.fallbackIcon ?? '';
    const displayName = details.displayName ?? '';
    const isSelectedMemberOwner = policy?.owner === details.login;
    const isSelectedMemberCurrentUser = accountID === currentUserPersonalDetails?.accountID;
    const isCurrentUserAdmin = policy?.employeeList?.[personalDetails?.[currentUserPersonalDetails?.accountID]?.login ?? '']?.role === CONST.POLICY.ROLE.ADMIN;
    const isCurrentUserOwner = policy?.owner === currentUserPersonalDetails?.login;

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
        if (!policy?.errorFields?.changeOwner && policy?.isChangeOwnerSuccessful) {
            return;
        }

        const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});

        if (changeOwnerErrors && changeOwnerErrors.length > 0) {
            Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(policyID, accountID, changeOwnerErrors[0] as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>));
        }
    }, [accountID, policy?.errorFields?.changeOwner, policy?.isChangeOwnerSuccessful, policyID]);

    const askForConfirmationToRemove = () => {
        setIsRemoveMemberConfirmModalVisible(true);
    };

    const removeUser = useCallback(() => {
        Policy.removeMembers([accountID], policyID);
        setIsRemoveMemberConfirmModalVisible(false);
        Navigation.goBack();
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
            Policy.updateWorkspaceMembersRole(policyID, [accountID], value);
        },
        [accountID, policyID],
    );

    const startChangeOwnershipFlow = useCallback(() => {
        Policy.clearWorkspaceOwnerChangeFlow(policyID);
        Policy.requestWorkspaceOwnerChange(policyID);
        Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(policyID, accountID, 'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>));
    }, [accountID, policyID]);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
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
                                    source={UserUtils.getAvatar(avatar, accountID)}
                                    size={CONST.AVATAR_SIZE.XLARGE}
                                    fallbackIcon={fallbackIcon}
                                />
                            </OfflineWithFeedback>
                            {Boolean(details.displayName ?? '') && (
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
                                prompt={translate('workspace.people.removeMemberPrompt', {memberName: displayName})}
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
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceMemberDetailsPage.displayName = 'WorkspaceMemberDetailsPage';

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsPage);
