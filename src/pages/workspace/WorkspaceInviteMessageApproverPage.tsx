import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {SelectionListApprover} from '@components/WorkspaceMembersSelectionList';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getDefaultApprover, getMemberAccountIDsForWorkspace, goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {setWorkspaceInviteApproverDraft} from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import MemberRightIcon from './MemberRightIcon';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type WorkspaceInviteMessageApproverPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER>;

const ACCESS_VARIANTS = [CONST.POLICY.ACCESS_VARIANTS.ADMIN];

function WorkspaceInviteMessageApproverPage({policy, personalDetails, isLoadingReportData, route}: WorkspaceInviteMessageApproverPageProps) {
    const {translate, localeCompare} = useLocalize();
    const viewportOffsetTop = useViewportOffsetTop();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const policyID = route.params.policyID;

    const defaultApprover = getDefaultApprover(policy);
    const [approverDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_APPROVER_DRAFT}${policyID}`);
    const selectedApprover = approverDraft ?? defaultApprover;

    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`);

    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);

    const invitedEmails = useMemo(() => Object.keys(invitedEmailsToAccountIDsDraft ?? {}), [invitedEmailsToAccountIDsDraft]);

    const employeeList = policy?.employeeList;
    const policyOwner = policy?.owner;
    const preventSelfApproval = policy?.preventSelfApproval;

    const policyMemberEmailsToAccountIDs = useMemo(() => getMemberAccountIDsForWorkspace(employeeList), [employeeList]);

    const allApprovers = useMemo(() => {
        if (!employeeList) {
            return [];
        }

        return Object.values(employeeList)
            .map((employee): SelectionListApprover | null => {
                const email = employee.email;

                if (!email || employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return null;
                }

                if (preventSelfApproval && invitedEmails.includes(email)) {
                    return null;
                }

                const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');

                if (!accountID) {
                    return null;
                }

                const {avatar, displayName = email, login} = personalDetails?.[accountID] ?? {};

                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: selectedApprover === email,
                    login: email,
                    icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                    rightElement: (
                        <MemberRightIcon
                            role={employee.role}
                            owner={policyOwner}
                            login={login}
                        />
                    ),
                };
            })
            .filter((approver): approver is SelectionListApprover => !!approver);
    }, [employeeList, policyOwner, preventSelfApproval, policyMemberEmailsToAccountIDs, invitedEmails, personalDetails, selectedApprover, icons.FallbackAvatar]);

    const orderedApprovers = useMemo(() => {
        const filteredApprovers = tokenizedSearch(allApprovers, getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode), (approver) => [approver.text ?? '', approver.login ?? '']);
        return sortAlphabetically(filteredApprovers, 'text', localeCompare);
    }, [allApprovers, debouncedSearchTerm, countryCode, localeCompare]);

    const backTo = route.params.backTo;

    const goBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const handleOnSelectRow = useCallback(
        (approver: SelectionListApprover) => {
            if (!approver.login) {
                return;
            }
            setWorkspaceInviteApproverDraft(policyID, approver.login);
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.goBack(backTo);
            });
        },
        [policyID, backTo],
    );

    const textInputOptions = useMemo(
        () => ({
            label: translate('selectionList.nameEmailOrPhoneNumber'),
            value: searchTerm,
            headerMessage: searchTerm && !orderedApprovers.length ? translate('common.noResultsFound') : '',
            onChangeText: setSearchTerm,
        }),
        [searchTerm, orderedApprovers.length, setSearchTerm, translate],
    );

    const screenWrapperStyle = useMemo(() => ({marginTop: viewportOffsetTop}), [viewportOffsetTop]);

    const accessDeniedViewProps = useMemo(
        () => ({
            subtitleKey: isEmptyObject(policy) ? undefined : ('workspace.common.notAuthorized' as const),
            onLinkPress: goBackFromInvalidPolicy,
        }),
        [policy],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={ACCESS_VARIANTS}
            fullPageNotFoundViewProps={accessDeniedViewProps}
        >
            <ScreenWrapper
                testID="WorkspaceInviteMessageApproverPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                style={screenWrapperStyle}
            >
                <HeaderWithBackButton
                    title={translate('workflowsPage.approver')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    data={orderedApprovers}
                    ListItem={InviteMemberListItem}
                    onSelectRow={handleOnSelectRow}
                    textInputOptions={textInputOptions}
                    shouldShowTextInput={allApprovers.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    showLoadingPlaceholder={isLoadingReportData}
                    initiallyFocusedItemKey={selectedApprover}
                    disableMaintainingScrollPosition
                    addBottomSafeAreaPadding
                    showScrollIndicator
                    isRowMultilineSupported
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInviteMessageApproverPage.displayName = 'WorkspaceInviteMessageApproverPage';

export default withPolicyAndFullscreenLoading(WorkspaceInviteMessageApproverPage);
