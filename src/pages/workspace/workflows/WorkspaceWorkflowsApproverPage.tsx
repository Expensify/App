import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
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
import type {WorkspacesCentralPaneNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as UserUtils from '@libs/UserUtils';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, PolicyMember} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceWorkflowsApproverPageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceWorkflowsApproverPageProps = WorkspaceWorkflowsApproverPageOnyxProps &
    WithPolicyAndFullscreenLoadingProps &
    StackScreenProps<WorkspacesCentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVER>;
type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};
type MembersSection = SectionListData<MemberOption, Section<MemberOption>>;

function WorkspaceWorkflowsApproverPage({policy, policyMembers, personalDetails, isLoadingReportData = true, route}: WorkspaceWorkflowsApproverPageProps) {
    const {translate} = useLocalize();
    const policyName = policy?.name ?? '';
    const [searchTerm, setSearchTerm] = useState('');
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const isDeletedPolicyMember = useCallback(
        (policyMember: PolicyMember) => !isOffline && policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyMember.errors),
        [isOffline],
    );

    const [formattedPolicyMembers, formattedApprover] = useMemo(() => {
        const policyMemberDetails: MemberOption[] = [];
        const approverDetails: MemberOption[] = [];

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
                approverDetails.push(formattedMember);
            } else {
                policyMemberDetails.push(formattedMember);
            }
        });
        return [policyMemberDetails, approverDetails];
    }, [personalDetails, policyMembers, translate, policy?.approver, StyleUtils, isDeletedPolicyMember, policy?.owner, styles]);

    const sections: MembersSection[] = useMemo(() => {
        const sectionsArray: MembersSection[] = [];

        if (searchTerm !== '') {
            const filteredOptions = [...formattedApprover, ...formattedPolicyMembers].filter((option) => {
                const searchValue = OptionsListUtils.getSearchValueForPhoneOrEmail(searchTerm);
                return !!option.text?.toLowerCase().includes(searchValue) || !!option.login?.toLowerCase().includes(searchValue);
            });
            return [
                {
                    title: undefined,
                    data: filteredOptions,
                    shouldShow: true,
                },
            ];
        }

        sectionsArray.push({
            title: undefined,
            data: formattedApprover,
            shouldShow: formattedApprover.length > 0,
        });

        sectionsArray.push({
            title: translate('common.all'),
            data: formattedPolicyMembers,
            shouldShow: true,
        });

        return sectionsArray;
    }, [formattedPolicyMembers, formattedApprover, searchTerm, translate]);

    const headerMessage = useMemo(
        () => (searchTerm && !sections[0].data.length ? translate('common.noResultsFound') : ''),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [translate, sections],
    );

    const setPolicyApprover = (member: MemberOption) => {
        if (!policy?.approvalMode || !personalDetails?.[member.accountID]?.login) {
            return;
        }
        const approver: string = personalDetails?.[member.accountID]?.login ?? policy.approver ?? policy.owner;
        Policy.setWorkspaceApprovalMode(policy.id, approver, policy.approvalMode);
        Navigation.goBack();
    };

    return (
        <FeatureEnabledAccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceWorkflowsApproverPage.displayName}
            >
                <FullPageNotFoundView
                    shouldShow={(isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy)}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                    onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
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
                        shouldDebounceRowSelect
                        showScrollIndicator
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </FeatureEnabledAccessOrNotFoundWrapper>
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
