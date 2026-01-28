import {useIsFocused} from '@react-navigation/native';
import reportsSelector from '@selectors/Attributes';
import React, {useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import {Plus} from '@components/Icon/Expensicons';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useConfirmModal from '@hooks/useConfirmModal';
import useFilteredSelection from '@hooks/useFilteredSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {removeFromGroupChat, updateGroupChatMemberRoles} from '@libs/actions/Report';
import {clearUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ParticipantsNavigatorParamList} from '@libs/Navigation/types';
import {isSearchStringMatchUserDetails} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault, getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {
    getReportPersonalDetailsParticipants,
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
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};

type ReportParticipantsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.ROOT>;
function ReportParticipantsPage({report, route}: ReportParticipantsPageProps) {
    const backTo = route.params.backTo;
    const icons = useMemoizedLazyExpensifyIcons(['User', 'MakeAdmin', 'RemoveMembers', 'FallbackAvatar']);
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the selection mode only on small screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const selectionListRef = useRef<SelectionListHandle<MemberOption>>(null);
    const textInputRef = useRef<BaseTextInputRef>(null);
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE, {canBeMissing: true});
    const isReportArchived = useReportIsArchived(report?.reportID);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`, {canBeMissing: false});
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportsSelector, canBeMissing: true});
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const currentUserAccountID = Number(session?.accountID);
    const isCurrentUserAdmin = isGroupChatAdmin(report, currentUserAccountID);
    const isGroupChat = isGroupChatUtils(report);
    const isCurrentUserGroupChatAdmin = isGroupChat && isCurrentUserAdmin;
    const isFocused = useIsFocused();
    const {isOffline} = useNetwork();
    const canSelectMultiple = isGroupChat && isCurrentUserAdmin && (isSmallScreenWidth ? isMobileSelectionModeEnabled : true);
    const [searchValue, setSearchValue] = useState('');

    const {chatParticipants, personalDetailsParticipants} = getReportPersonalDetailsParticipants(report, personalDetails, reportMetadata);

    const filterParticipants = (participant?: PersonalDetails) => {
        if (!participant) {
            return false;
        }
        const isInParticipants = chatParticipants.includes(participant.accountID);
        const pendingChatMember = reportMetadata?.pendingChatMembers?.find((member) => member.accountID === participant.accountID.toString());
        const isPendingDelete = pendingChatMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        return isInParticipants && !isPendingDelete;
    };

    const [selectedMembers, setSelectedMembers] = useFilteredSelection(personalDetailsParticipants, filterParticipants);

    const pendingChatMembers = reportMetadata?.pendingChatMembers;
    const reportParticipants = report?.participants;

    // Get the active chat members by filtering out the pending members with delete action
    const activeParticipants = chatParticipants.filter((accountID) => {
        const pendingMember = pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
        if (!personalDetails?.[accountID]) {
            return false;
        }

        // When offline, we want to include the pending members with delete action as they are displayed in the list as well
        return !pendingMember || isOffline || pendingMember.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    });

    // Include the search bar when there are STANDARD_LIST_ITEM_LIMIT or more active members in the selection list
    const shouldShowTextInput = activeParticipants.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        if (shouldShowTextInput) {
            setSearchValue(userSearchPhrase ?? '');
        } else {
            clearUserSearchPhrase();
            setSearchValue('');
        }
    }, [isFocused, setSearchValue, shouldShowTextInput, userSearchPhrase]);

    useSearchBackPress({
        onClearSelection: () => setSelectedMembers([]),
        onNavigationCallBack: () => {
            if (!report) {
                return;
            }

            setSearchValue('');
            Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
        },
    });

    const toggleUser = (user: MemberOption) => {
        if (user.accountID === currentUserAccountID) {
            return;
        }

        if (selectedMembers.includes(user.accountID)) {
            setSelectedMembers((prevSelected) => prevSelected.filter((id) => id !== user.accountID));
        } else {
            setSelectedMembers((prevSelected) => [...prevSelected, user.accountID]);
        }
    };

    const toggleAllUsers = (memberList: MemberOption[]) => {
        const enabledAccounts = memberList.filter((member) => !member.isDisabled && !member.isDisabledCheckbox);
        const someSelected = enabledAccounts.some((member) => selectedMembers.includes(member.accountID));
        if (someSelected) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(enabledAccounts.map((member) => member.accountID));
        }
    };

    const removeUsers = () => {
        const accountIDsToRemove = selectedMembers.filter((id) => id !== currentUserAccountID);
        removeFromGroupChat(report.reportID, accountIDsToRemove);
        setSearchValue('');
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setSelectedMembers([]);
            clearUserSearchPhrase();
        });
    };

    const showRemoveMembersModal = async () => {
        const {action} = await showConfirmModal({
            title: translate('workspace.people.removeMembersTitle', {count: selectedMembers.length}),
            prompt: translate('workspace.people.removeMembersPrompt', {
                count: selectedMembers.length,
                memberName: formatPhoneNumber(getPersonalDetailsByIDs({accountIDs: selectedMembers, currentUserAccountID}).at(0)?.displayName ?? ''),
            }),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
            danger: true,
        });

        if (textInputRef.current) {
            textInputRef.current.focus();
        }

        if (action === ModalActions.CONFIRM) {
            removeUsers();
        }
    };

    const changeUserRole = (role: ValueOf<typeof CONST.REPORT.ROLE>) => {
        const accountIDsToUpdate = selectedMembers.filter((id) => report.participants?.[id].role !== role);
        updateGroupChatMemberRoles(report.reportID, accountIDsToUpdate, role);
        setSelectedMembers([]);
    };

    const openMemberDetails = (item: MemberOption) => {
        if (isGroupChat && isCurrentUserAdmin) {
            Navigation.navigate(ROUTES.REPORT_PARTICIPANTS_DETAILS.getRoute(report.reportID, item.accountID, backTo));
            return;
        }
        Navigation.navigate(ROUTES.PROFILE.getRoute(item.accountID, Navigation.getActiveRoute()));
    };

    // Build participants list
    let participants: MemberOption[] = [];
    for (const accountID of chatParticipants) {
        const role = reportParticipants?.[accountID].role;
        const details = personalDetails?.[accountID];

        if (!details || (searchValue.trim() && !isSearchStringMatchUserDetails(details, searchValue))) {
            continue;
        }

        const pendingChatMember = pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
        const pendingAction = pendingChatMember?.pendingAction ?? reportParticipants?.[accountID]?.pendingAction;
        if (!isOffline && pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        const isAdmin = role === CONST.REPORT.ROLE.ADMIN;

        participants.push({
            keyForList: `${accountID}`,
            accountID,
            isSelected: selectedMembers.includes(accountID) && canSelectMultiple,
            isDisabledCheckbox: accountID === currentUserAccountID,
            isDisabled: pendingChatMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || details?.isOptimisticPersonalDetail,
            text: formatPhoneNumber(getDisplayNameOrDefault(details)),
            alternateText: formatPhoneNumber(details?.login ?? ''),
            rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : null,
            pendingAction,
            icons: [
                {
                    source: details?.avatar ?? icons.FallbackAvatar,
                    name: formatPhoneNumber(details?.login ?? ''),
                    type: CONST.ICON_TYPE_AVATAR,
                    id: accountID,
                },
            ],
        });
    }
    participants = participants.sort((a, b) => localeCompare((a.text ?? '').toLowerCase(), (b.text ?? '').toLowerCase()));

    const isAtLeastOneAdminSelected = selectedMembers.some((accountId) => report.participants?.[accountId]?.role === CONST.REPORT.ROLE.ADMIN);
    const isAtLeastOneMemberSelected = selectedMembers.some((accountId) => report.participants?.[accountId]?.role === CONST.REPORT.ROLE.MEMBER);

    // We use spread to define this array in one statement because showRemoveMembersModal accesses textInputRef.current.
    // React Compiler can't tell that onSelected is a callback (not invoked during render), so modifying this array
    // in a separate statement (e.g. with .push() or .filter()) triggers: "Cannot access refs during render"
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
                      text: translate('workspace.people.makeAdmin', {count: selectedMembers.length}),
                      value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_ADMIN,
                      icon: icons.MakeAdmin,
                      onSelected: () => changeUserRole(CONST.REPORT.ROLE.ADMIN),
                  },
              ]
            : []),
    ];

    const headerContent = (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween]}>
            <View>
                <Text style={[styles.textMicroSupporting, canSelectMultiple ? styles.ml3 : styles.ml0]}>{translate('common.member')}</Text>
            </View>
            {isGroupChat && (
                <View style={[StyleUtils.getMinimumWidth(60)]}>
                    <Text style={[styles.textMicroSupporting, styles.textAlignCenter]}>{translate('common.role')}</Text>
                </View>
            )}
        </View>
    );

    const customListHeader = canSelectMultiple ? (
        headerContent
    ) : (
        <View style={[styles.peopleRow, styles.userSelectNone, styles.ph9, styles.pb5, shouldShowTextInput ? styles.mt3 : styles.mt0]}>{headerContent}</View>
    );

    const selectionModeHeader = isMobileSelectionModeEnabled && isSmallScreenWidth;

    const headerTitle =
        isChatRoom(report) || isPolicyExpenseChat(report) || isChatThread(report) || isTaskReport(report) || isMoneyRequestReport(report) || isGroupChat
            ? translate('common.members')
            : translate('common.details');

    // eslint-disable-next-line rulesdir/no-negated-variables
    const memberNotFoundMessage = isGroupChat
        ? `${translate('roomMembersPage.memberNotFound')} ${translate('roomMembersPage.useInviteButton')}`
        : translate('roomMembersPage.memberNotFound');

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID="ReportParticipantsPage"
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
                            setSearchValue('');
                            Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
                        }
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
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
                                    onPress={() => Navigation.navigate(ROUTES.REPORT_PARTICIPANTS_INVITE.getRoute(report.reportID, backTo))}
                                    text={translate('workspace.invite.member')}
                                    icon={Plus}
                                    innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                                    style={[shouldUseNarrowLayout && styles.flexGrow1]}
                                />
                            )}
                        </View>
                    )}
                </View>
                <View style={[styles.w100, isGroupChat ? styles.mt3 : styles.mt0, styles.flex1]}>
                    <SelectionListWithModal
                        data={participants}
                        ref={selectionListRef}
                        ListItem={TableListItem}
                        onSelectRow={openMemberDetails}
                        textInputOptions={{
                            label: translate('selectionList.findMember'),
                            value: searchValue,
                            onChangeText: setSearchValue,
                            headerMessage: searchValue.trim() && !participants.length ? memberNotFoundMessage : '',
                            ref: textInputRef,
                        }}
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress={isCurrentUserGroupChatAdmin}
                        shouldSingleExecuteRowSelect={!isCurrentUserGroupChatAdmin}
                        onTurnOnSelectionMode={(item) => item && toggleUser(item)}
                        style={{listHeaderWrapperStyle: [styles.ph9, styles.mt3]}}
                        onSelectAll={() => toggleAllUsers(participants)}
                        onCheckboxPress={toggleUser}
                        shouldShowTextInput={shouldShowTextInput}
                        customListHeader={customListHeader}
                        showScrollIndicator
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(ReportParticipantsPage);
