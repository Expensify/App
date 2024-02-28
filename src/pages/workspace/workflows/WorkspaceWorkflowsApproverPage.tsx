import React, {useMemo, useState} from 'react';
import {SectionListData} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Badge from '@components/Badge';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem, Section} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, PolicyMember} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import withPolicyAndFullscreenLoading from '../withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '../withPolicyAndFullscreenLoading';

type WorkspaceWorkflowsApproverPageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceWorkflowsApproverPageProps = WorkspaceWorkflowsApproverPageOnyxProps & WithPolicyAndFullscreenLoadingProps;
type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};
type MembersSection = SectionListData<MemberOption, Section<MemberOption>>;

function WorkspaceWorkflowsApproverPage({policy, policyMembers, personalDetails}: WorkspaceWorkflowsApproverPageProps) {
    const {translate} = useLocalize();
    const policyName = policy?.name ?? '';
    const [searchTerm, setSearchTerm] = useState('');
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        return OptionsListUtils.getHeaderMessage(true, false, searchValue);
    }, [translate, searchTerm, policyName]);

    const isDeletedPolicyMember = (policyMember: PolicyMember): boolean =>
        !isOffline && policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyMember.errors);

    const [formattedPolicyMembers, formattedApprover] = useMemo(() => {
        const formattedPolicyMembers: MemberOption[] = [];
        const formattedApprover: MemberOption[] = [];

        Object.entries(policyMembers ?? {}).forEach(([accountIDKey, policyMember]) => {
            const accountID = Number(accountIDKey);
            if (isDeletedPolicyMember(policyMember)) {
                return;
            }

            const details = personalDetails?.[accountID];
            if (!details) {
                Log.hmmm(`[WorkspaceMembersPage] no personal details found for policy member with accountID: ${accountID}`);
                return;
            }

            const isOwner = policy?.owner === details.login;
            const isAdmin = policyMember.role === CONST.POLICY.ROLE.ADMIN;

            let roleBadge = null;
            if (isOwner || isAdmin) {
                roleBadge = (
                    <Badge
                        text={isOwner ? translate('common.owner') : translate('common.admin')}
                        textStyles={styles.textStrong}
                        badgeStyles={[styles.justifyContentCenter, StyleUtils.getMinimumWidth(60), styles.badgeBordered]}
                    />
                );
            }

            const formattedMember = {
                keyForList: accountIDKey,
                accountID,
                isSelected: policy?.approver === details.login,
                isDisabled: policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(policyMember.errors),
                text: formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                rightElement: roleBadge,
                icons: [
                    {
                        source: UserUtils.getAvatar(details.avatar, accountID),
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: policyMember.errors,
                pendingAction: policyMember.pendingAction,
            };

            if (policy?.approver === details.login) {
                approverSection.push(formattedMember);
            } else {
                policyUsersSection.push(formattedMember);
            }
        });

        sectionsArr.push({
            title: undefined,
            data: approverSection,
            shouldShow: true,
            indexOffset: 0,
        });

        sectionsArr.push({
            title: translate('common.all'),
            data: policyUsersSection,
            shouldShow: true,
            indexOffset: approverSection.length,
        });

        return sectionsArr;
    }, [personalDetails, policyMembers, searchTerm, translate, policy?.approver]);

    const setPolicyApprover = (member: MemberOption) => {
        if (!policy || !policy.approvalMode || !personalDetails?.[member.accountID]?.login) {
            return;
        }
        const approver: string = personalDetails?.[member.accountID]?.login || policy.approver || policy.owner;
        Policy.setWorkspaceApprovalMode(policy.id, approver, policy.approvalMode);
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceWorkflowsApproverPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workflowsPage.approver')}
                subtitle={policyName}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList
                sections={sections}
                textInputLabel={translate('optionsSelector.findMember')}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                headerMessage={headerMessage}
                ListItem={UserListItem}
                onSelectRow={setPolicyApprover}
                showScrollIndicator
            />
        </ScreenWrapper>
    );
}

WorkspaceWorkflowsApproverPage.displayName = 'WorkspaceWorkflowsApproverPage';

export default compose(
    withOnyx<WorkspaceWorkflowsApproverPageProps, WorkspaceWorkflowsApproverPageOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
    withPolicyAndFullscreenLoading,
)(WorkspaceWorkflowsApproverPage);
