// import { View } from 'react-native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo, useState} from 'react';
// import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {SectionListData} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, PolicyMember} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceWorkflowsPayerPageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceWorkflowsPayerPageProps = WorkspaceWorkflowsPayerPageOnyxProps &
    WithPolicyAndFullscreenLoadingProps &
    StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_PAYER>;
type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};
type MembersSection = SectionListData<MemberOption, Section<MemberOption>>;

function WorkspaceWorkflowsPayerPage({route, policy, policyMembers, personalDetails}: WorkspaceWorkflowsPayerPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const policyName = policy?.name ?? '';
    const {isOffline} = useNetwork();

    const [searchTerm, setSearchTerm] = useState('');

    const isDeletedPolicyMember = useCallback(
        (policyMember: PolicyMember) => !isOffline && policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyMember.errors),
        [isOffline],
    );

    const [formattedPolicyAdmins, formattedAuthorizedPayer] = useMemo(() => {
        const policyAdminDetails: MemberOption[] = [];
        const authorizedPayerDetails: MemberOption[] = [];

        Object.entries(policyMembers ?? {}).forEach(([accountIDKey, policyMember]) => {
            if (isDeletedPolicyMember(policyMember)) {
                return;
            }
            const accountID = Number(accountIDKey);
            if (isDeletedPolicyMember(policyMember)) {
                return;
            }

            const details = personalDetails?.[accountID];
            if (!details) {
                Log.hmmm(`[WorkspaceMembersPage] no personal details found for policy member with accountID: ${accountID}`);
            }
            const isOwner = policy?.owner === details?.login;
            const isAdmin = policyMember.role === CONST.POLICY.ROLE.ADMIN;

            if (!isOwner && !isAdmin) {
                return;
            }

            const roleBadge = (
                <Badge
                    text={isOwner ? translate('common.owner') : translate('common.admin')}
                    textStyles={styles.textStrong}
                    badgeStyles={[styles.justifyContentCenter, StyleUtils.getMinimumWidth(60), styles.badgeBordered]}
                />
            );

            const formattedMember = {
                keyForList: accountIDKey,
                accountID,
                isSelected: policy?.authorizedPayerAccountID === accountID,
                isDisabled: policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(policyMember.errors),
                text: formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                rightElement: roleBadge,
                icons: [
                    {
                        source: UserUtils.getAvatar(details?.avatar, accountID),
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: policyMember.errors,
                pendingAction: policyMember.pendingAction,
            };

            if (policy?.authorizedPayerAccountID === accountID) {
                authorizedPayerDetails.push(formattedMember);
            } else {
                policyAdminDetails.push(formattedMember);
            }
        });
        return [policyAdminDetails, authorizedPayerDetails];
    }, [personalDetails, policyMembers, translate, policy?.authorizedPayerAccountID, isDeletedPolicyMember, policy?.owner, styles, StyleUtils]);

    const sections: MembersSection[] = useMemo(() => {
        const sectionsArray: MembersSection[] = [];

        if (searchTerm !== '') {
            const filteredOptions = [...formattedPolicyAdmins, ...formattedAuthorizedPayer].filter((option) => {
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
            data: formattedAuthorizedPayer,
            shouldShow: true,
            indexOffset: formattedPolicyAdmins.length,
        });

        sectionsArray.push({
            title: translate('workflowsPage.admins'),
            data: formattedPolicyAdmins,
            shouldShow: true,
            indexOffset: 0,
        });
        return sectionsArray;
    }, [formattedPolicyAdmins, formattedAuthorizedPayer, translate, searchTerm]);

    const headerMessage = useMemo(
        () => (searchTerm && !sections[0].data.length ? translate('common.noResultsFound') : ''),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [translate, sections],
    );

    const setPolicyAuthorizedPayer = (member: MemberOption) => {
        if (policy?.authorizedPayerAccountID === member.accountID) {
            return;
        }

        if (policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES) {
            return;
        }

        Policy.setWorkspacePayer(policy?.id, member.accountID);
        Navigation.goBack();
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    testID={WorkspaceWorkflowsPayerPage.displayName}
                >
                    <HeaderWithBackButton
                        title={translate('workflowsPage.authorizedPayer')}
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
                        onSelectRow={(admin) => setPolicyAuthorizedPayer(admin)}
                        showScrollIndicator
                    />
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsPayerPage.displayName = 'WorkspaceWorkflowsPayerPage';

export default compose(
    withOnyx<WorkspaceWorkflowsPayerPageProps, WorkspaceWorkflowsPayerPageOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
    withPolicyAndFullscreenLoading,
)(WorkspaceWorkflowsPayerPage);
