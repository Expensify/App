import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {TupleToUnion, ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import type {TableHandle} from '@components/Table';
import type {ReportParticipantRowData, ReportParticipantsTableColumnKey} from '@components/Tables/ReportParticipantsTable';
import ReportParticipantsTable from '@components/Tables/ReportParticipantsTable';
import useConfirmModal from '@hooks/useConfirmModal';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useFilteredSelection from '@hooks/useFilteredSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {openRoomMembersPage, removeFromGroupChat, updateGroupChatMemberRoles} from '@libs/actions/Report';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ParticipantsNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {
    getReportPersonalDetailsParticipants,
    isAnnounceRoom,
    isArchivedNonExpenseReport,
    isChatRoom,
    isChatThread,
    isGroupChatAdmin,
    isGroupChat as isGroupChatUtils,
    isMoneyRequestReport,
    isPolicyExpenseChat,
    isSelfDM,
    isTaskReport,
} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {PersonalDetails} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type DynamicReportParticipantsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DYNAMIC_ROOT>;
function DynamicReportParticipantsPage({report}: DynamicReportParticipantsPageProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_PARTICIPANTS.path);
    const navigateBackToReportDetails = () => {
        Navigation.goBack(backPath);
    };
    const icons = useMemoizedLazyExpensifyIcons(['MakeAdmin', 'Plus', 'RemoveMembers', 'User']);
    const {translate, formatPhoneNumber} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const styles = useThemeStyles();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the selection mode only on small screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const tableRef = useRef<TableHandle<ReportParticipantRowData, ReportParticipantsTableColumnKey, string>>(null);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`);
    const reportAttributes = useReportAttributes();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const currentUserAccountID = Number(session?.accountID);
    const isCurrentUserAdmin = isGroupChatAdmin(report, currentUserAccountID);
    const isGroupChat = isGroupChatUtils(report);
    const isCurrentUserGroupChatAdmin = isGroupChat && isCurrentUserAdmin;
    const {isOffline} = useNetwork();
    const canSelectMultiple = isGroupChat && isCurrentUserAdmin && (isSmallScreenWidth ? isMobileSelectionModeEnabled : true);

    const {personalDetailsParticipants, participantsForDisplay} = getReportPersonalDetailsParticipants(report, personalDetails, reportMetadata);
    const participantsForDisplayMap = participantsForDisplay.reduce<Record<number, TupleToUnion<typeof participantsForDisplay>>>((acc, participant) => {
        acc[participant.accountID] = participant;
        return acc;
    }, {});

    const filterParticipants = (participant?: PersonalDetails) => {
        if (!participant) {
            return false;
        }
        return !!participantsForDisplayMap[participant.accountID] && !participantsForDisplayMap[participant.accountID].isPendingDelete;
    };

    const [selectedMembers, setSelectedMembers] = useFilteredSelection(personalDetailsParticipants, filterParticipants);
    const firstSelectedMember = selectedMembers?.at(0);
    const [firstSelectedMemberDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector(firstSelectedMember)});

    // The Table stores selection as string keys, while this page tracks accountIDs as numbers.
    const onRowSelectionChange = (keys: string[]) => setSelectedMembers(keys.map(Number));

    // Get the active chat members by filtering out the pending members with delete action
    const activeParticipants = participantsForDisplay.filter((participant) => isOffline || !participant.isPendingDelete);

    // Include the search bar when there are STANDARD_LIST_ITEM_LIMIT or more active members in the list
    const shouldShowSearchBar = activeParticipants.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    useEffect(() => {
        if (!isAnnounceRoom(report)) {
            return;
        }
        openRoomMembersPage(report.reportID);
        // We only want to fetch room members once on mount, not when report changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useSearchBackPress({
        onClearSelection: () => setSelectedMembers([]),
        onNavigationCallBack: () => {
            if (!report) {
                return;
            }

            navigateBackToReportDetails();
        },
    });

    const removeUsers = () => {
        const accountIDsToRemove = selectedMembers.filter((id) => id !== currentUserAccountID);
        removeFromGroupChat(report, accountIDsToRemove);
        setSelectedMembers([]);
    };

    const showRemoveMembersModal = async () => {
        const {action} = await showConfirmModal({
            title: translate('workspace.people.removeMembersTitle', {count: selectedMembers.length}),
            prompt: translate('workspace.people.removeMembersPrompt', {
                count: selectedMembers.length,
                memberName: formatPhoneNumber(firstSelectedMemberDetails?.displayName ?? ''),
            }),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
            danger: true,
        });

        if (action === ModalActions.CONFIRM) {
            removeUsers();
        }
    };

    const changeUserRole = (role: ValueOf<typeof CONST.REPORT.ROLE>) => {
        const accountIDsToUpdate = selectedMembers.filter((id) => report.participants?.[id].role !== role);
        updateGroupChatMemberRoles(report.reportID, accountIDsToUpdate, role);
        setSelectedMembers([]);
    };

    const openMemberDetails = (accountID: number) => {
        if (isGroupChat && isCurrentUserAdmin) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_PARTICIPANTS_DETAILS.getRoute(accountID)));
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(accountID)));
    };

    // Build participants list. Sorting/searching/selection are handled internally by the Table.
    const participants: ReportParticipantRowData[] = activeParticipants.map((participantForDisplay) => {
        const {accountID, details, isDisabled, pendingAction, role} = participantForDisplay;

        return {
            keyForList: `${accountID}`,
            accountID,
            login: details?.login ?? '',
            name: formatPhoneNumber(getDisplayNameOrDefault(details)),
            email: formatPhoneNumber(details?.login ?? ''),
            isAdmin: role === CONST.REPORT.ROLE.ADMIN,
            isGroupChat,
            disabled: isDisabled,
            isSelectionDisabled: accountID === currentUserAccountID,
            pendingAction,
            action: () => openMemberDetails(accountID),
        };
    });

    const selectedKeys = selectedMembers.map(String);

    const isAtLeastOneAdminSelected = selectedMembers.some((accountId) => participantsForDisplayMap[accountId]?.role === CONST.REPORT.ROLE.ADMIN);
    const isAtLeastOneMemberSelected = selectedMembers.some((accountId) => participantsForDisplayMap[accountId]?.role === CONST.REPORT.ROLE.MEMBER);

    // We use spread to define this array in one statement because the onSelected callbacks reference values computed during render.
    // React Compiler can't tell that onSelected is a callback (not invoked during render), so modifying this array
    // in a separate statement (e.g. with .push() or .filter()) can trigger render-time errors.
    const bulkActionsButtonOptions: Array<DropdownOption<WorkspaceMemberBulkActionType>> = [
        {
            text: translate('workspace.people.removeMembersTitle', {count: selectedMembers.length}),
            value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
            icon: icons.RemoveMembers,
            onSelected: showRemoveMembersModal,
        },
        ...(isAtLeastOneAdminSelected
            ? [
                  {
                      text: translate('workspace.people.makeMember', {count: selectedMembers.length}),
                      value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_MEMBER,
                      icon: icons.User,
                      onSelected: () => changeUserRole(CONST.REPORT.ROLE.MEMBER),
                  },
              ]
            : []),
        ...(isAtLeastOneMemberSelected
            ? [
                  {
                      text: translate('workspace.people.makeGroupAdmin', {count: selectedMembers.length}),
                      value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_ADMIN,
                      icon: icons.MakeAdmin,
                      onSelected: () => changeUserRole(CONST.REPORT.ROLE.ADMIN),
                  },
              ]
            : []),
    ];

    const selectionModeHeader = isMobileSelectionModeEnabled && isSmallScreenWidth;

    const headerTitle =
        isChatRoom(report) || isPolicyExpenseChat(report) || isChatThread(report) || isTaskReport(report) || isMoneyRequestReport(report) || isGroupChat
            ? translate('common.members')
            : translate('common.details');

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID="DynamicReportParticipantsPage"
        >
            <FullPageNotFoundView shouldShow={!report || isArchivedNonExpenseReport(report, isReportArchived) || isSelfDM(report)}>
                <HeaderWithBackButton
                    title={selectionModeHeader ? translate('common.selectMultiple') : headerTitle}
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            setSelectedMembers([]);
                            turnOffMobileSelectionMode();
                            return;
                        }

                        if (report) {
                            navigateBackToReportDetails();
                        }
                    }}
                    subtitle={StringUtils.lineBreaksToSpaces(getReportName(report, reportAttributes))}
                />
                <View style={[styles.pl5, styles.pr5]}>
                    {isGroupChat && (
                        <View style={styles.w100}>
                            {(isSmallScreenWidth ? canSelectMultiple : selectedMembers.length > 0) ? (
                                <ButtonWithDropdownMenu<WorkspaceMemberBulkActionType>
                                    shouldAlwaysShowDropdownMenu
                                    pressOnEnter
                                    customText={translate('workspace.common.selected', {count: selectedMembers.length})}
                                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                                    onPress={() => null}
                                    isSplitButton={false}
                                    options={bulkActionsButtonOptions}
                                    style={[shouldUseNarrowLayout && styles.flexGrow1]}
                                    isDisabled={!selectedMembers.length}
                                />
                            ) : (
                                <Button
                                    success
                                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_PARTICIPANTS_INVITE.path))}
                                    text={translate('workspace.invite.member')}
                                    icon={icons.Plus}
                                    innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                                    style={[shouldUseNarrowLayout && styles.flexGrow1]}
                                />
                            )}
                        </View>
                    )}
                </View>
                <View style={[styles.w100, isGroupChat ? styles.mt3 : styles.mt0, styles.flex1]}>
                    <ReportParticipantsTable
                        ref={tableRef}
                        members={participants}
                        isGroupChat={isGroupChat}
                        selectionEnabled={isCurrentUserGroupChatAdmin}
                        selectedKeys={selectedKeys}
                        shouldShowSearchBar={shouldShowSearchBar}
                        onRowSelectionChange={onRowSelectionChange}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicReportParticipantsPage);
