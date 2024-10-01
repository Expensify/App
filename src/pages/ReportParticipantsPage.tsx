import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {TextInput} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import * as Report from '@libs/actions/Report';
import * as UserSearchPhraseActions from '@libs/actions/RoomMembersUserSearchPhrase';
import Navigation from '@libs/Navigation/Navigation';
import type {ParticipantsNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};

type ReportParticipantsPageProps = WithReportOrNotFoundProps & StackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.ROOT>;
function ReportParticipantsPage({report, route}: ReportParticipantsPageProps) {
    const backTo = route.params.backTo;
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const selectionListRef = useRef<SelectionListHandle>(null);
    const textInputRef = useRef<TextInput>(null);
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID ?? -1}`);
    const {selectionMode} = useMobileSelectionMode();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const currentUserAccountID = Number(session?.accountID);
    const isCurrentUserAdmin = ReportUtils.isGroupChatAdmin(report, currentUserAccountID);
    const isGroupChat = useMemo(() => ReportUtils.isGroupChat(report), [report]);
    const isFocused = useIsFocused();
    const {isOffline} = useNetwork();
    const canSelectMultiple = isGroupChat && isCurrentUserAdmin && (isSmallScreenWidth ? selectionMode?.isEnabled : true);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    useEffect(
        () => () => {
            UserSearchPhraseActions.clearUserSearchPhrase();
        },
        [],
    );

    useEffect(() => {
        UserSearchPhraseActions.updateUserSearchPhrase(debouncedSearchValue);
    }, [debouncedSearchValue]);

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedMembers([]);
    }, [isFocused]);

    const chatParticipants = ReportUtils.getParticipantsList(report, personalDetails);

    const pendingChatMembers = report?.pendingChatMembers;
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

    // Include the search bar when there are 8 or more active members in the selection list
    const shouldShowTextInput = activeParticipants.length >= CONST.SHOULD_SHOW_MEMBERS_SEARCH_INPUT_BREAKPOINT;

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        if (shouldShowTextInput) {
            setSearchValue(userSearchPhrase ?? '');
        } else {
            UserSearchPhraseActions.clearUserSearchPhrase();
            setSearchValue('');
        }
    }, [isFocused, setSearchValue, shouldShowTextInput, userSearchPhrase]);

    const getParticipants = () => {
        let result: MemberOption[] = [];

        chatParticipants.forEach((accountID) => {
            const role = reportParticipants?.[accountID].role;
            const details = personalDetails?.[accountID];

            // If search value is provided, filter out members that don't match the search value
            if (!details || (searchValue.trim() && !OptionsListUtils.isSearchStringMatchUserDetails(details, searchValue))) {
                return;
            }

            const pendingChatMember = pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
            const isSelected = selectedMembers.includes(accountID) && canSelectMultiple;
            const isAdmin = role === CONST.REPORT.ROLE.ADMIN;
            let roleBadge = null;
            if (isAdmin) {
                roleBadge = <Badge text={translate('common.admin')} />;
            }

            const pendingAction = pendingChatMember?.pendingAction ?? reportParticipants?.[accountID]?.pendingAction;

            result.push({
                keyForList: `${accountID}`,
                accountID,
                isSelected,
                isDisabledCheckbox: accountID === currentUserAccountID,
                isDisabled: pendingChatMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || details?.isOptimisticPersonalDetail,
                text: formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                rightElement: roleBadge,
                pendingAction,
                icons: [
                    {
                        source: details?.avatar ?? Expensicons.FallbackAvatar,
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
            });
        });

        result = result.sort((a, b) => (a.text ?? '').toLowerCase().localeCompare((b.text ?? '').toLowerCase()));
        return result;
    };

    const participants = getParticipants();

    /**
     * Add user from the selectedMembers list
     */
    const addUser = useCallback((accountID: number) => setSelectedMembers((prevSelected) => [...prevSelected, accountID]), [setSelectedMembers]);

    /**
     * Add or remove all users passed from the selectedEmployees list
     */
    const toggleAllUsers = (memberList: MemberOption[]) => {
        const enabledAccounts = memberList.filter((member) => !member.isDisabled && !member.isDisabledCheckbox);
        const everyoneSelected = enabledAccounts.every((member) => selectedMembers.includes(member.accountID));

        if (everyoneSelected) {
            setSelectedMembers([]);
        } else {
            const everyAccountId = enabledAccounts.map((member) => member.accountID);
            setSelectedMembers(everyAccountId);
        }
    };

    /**
     * Remove user from the selectedMembers list
     */
    const removeUser = useCallback(
        (accountID: number) => {
            setSelectedMembers((prevSelected) => prevSelected.filter((id) => id !== accountID));
        },
        [setSelectedMembers],
    );

    /**
     * Open the modal to invite a user
     */
    const inviteUser = useCallback(() => {
        Navigation.navigate(ROUTES.REPORT_PARTICIPANTS_INVITE.getRoute(report.reportID, backTo));
    }, [report, backTo]);

    /**
     * Remove selected users from the workspace
     * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
     */
    const removeUsers = () => {
        // Remove the admin from the list
        const accountIDsToRemove = selectedMembers.filter((id) => id !== currentUserAccountID);
        Report.removeFromGroupChat(report.reportID, accountIDsToRemove);
        setSearchValue('');
        UserSearchPhraseActions.clearUserSearchPhrase();
        setSelectedMembers([]);
        setRemoveMembersConfirmModalVisible(false);
    };

    const changeUserRole = useCallback(
        (role: ValueOf<typeof CONST.REPORT.ROLE>) => {
            const accountIDsToUpdate = selectedMembers.filter((id) => report.participants?.[id].role !== role);
            Report.updateGroupChatMemberRoles(report.reportID, accountIDsToUpdate, role);
            setSelectedMembers([]);
        },
        [report, selectedMembers],
    );

    /**
     * Toggle user from the selectedMembers list
     */
    const toggleUser = useCallback(
        (user: MemberOption) => {
            if (user.accountID === currentUserAccountID) {
                return;
            }

            // Add or remove the user if the checkbox is enabled
            if (selectedMembers.includes(user.accountID)) {
                removeUser(user.accountID);
            } else {
                addUser(user.accountID);
            }
        },
        [selectedMembers, addUser, removeUser, currentUserAccountID],
    );

    const customListHeader = useMemo(() => {
        const header = (
            <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween]}>
                <View>
                    <Text style={[styles.searchInputStyle, canSelectMultiple ? styles.ml3 : styles.ml0]}>{translate('common.member')}</Text>
                </View>
                {isGroupChat && (
                    <View style={[StyleUtils.getMinimumWidth(60)]}>
                        <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('common.role')}</Text>
                    </View>
                )}
            </View>
        );

        if (canSelectMultiple) {
            return header;
        }

        return <View style={[styles.peopleRow, styles.userSelectNone, styles.ph9, styles.pb5, shouldShowTextInput ? styles.mt3 : styles.mt0]}>{header}</View>;
    }, [styles, translate, isGroupChat, shouldShowTextInput, StyleUtils, canSelectMultiple]);

    const bulkActionsButtonOptions = useMemo(() => {
        const options: Array<DropdownOption<WorkspaceMemberBulkActionType>> = [
            {
                text: translate('workspace.people.removeMembersTitle'),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: Expensicons.RemoveMembers,
                onSelected: () => setRemoveMembersConfirmModalVisible(true),
            },
        ];

        const isAtleastOneAdminSelected = selectedMembers.some((accountId) => report.participants?.[accountId]?.role === CONST.REPORT.ROLE.ADMIN);

        if (isAtleastOneAdminSelected) {
            options.push({
                text: translate('workspace.people.makeMember'),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_MEMBER,
                icon: Expensicons.User,
                onSelected: () => changeUserRole(CONST.REPORT.ROLE.MEMBER),
            });
        }

        const isAtleastOneMemberSelected = selectedMembers.some((accountId) => report.participants?.[accountId]?.role === CONST.REPORT.ROLE.MEMBER);

        if (isAtleastOneMemberSelected) {
            options.push({
                text: translate('workspace.people.makeAdmin'),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_ADMIN,
                icon: Expensicons.MakeAdmin,
                onSelected: () => changeUserRole(CONST.REPORT.ROLE.ADMIN),
            });
        }

        return options;
    }, [changeUserRole, translate, setRemoveMembersConfirmModalVisible, selectedMembers, report.participants]);

    const headerButtons = useMemo(() => {
        if (!isGroupChat) {
            return;
        }

        return (
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
                        onPress={inviteUser}
                        text={translate('workspace.invite.member')}
                        icon={Expensicons.Plus}
                        innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                        style={[shouldUseNarrowLayout && styles.flexGrow1]}
                    />
                )}
            </View>
        );
    }, [bulkActionsButtonOptions, inviteUser, isSmallScreenWidth, selectedMembers, styles, translate, isGroupChat, canSelectMultiple, shouldUseNarrowLayout]);

    /** Opens the member details page */
    const openMemberDetails = useCallback(
        (item: MemberOption) => {
            if (isGroupChat && isCurrentUserAdmin) {
                Navigation.navigate(ROUTES.REPORT_PARTICIPANTS_DETAILS.getRoute(report.reportID, item.accountID, backTo));
                return;
            }
            Navigation.navigate(ROUTES.PROFILE.getRoute(item.accountID, Navigation.getActiveRoute()));
        },
        [report, isCurrentUserAdmin, isGroupChat, backTo],
    );
    const headerTitle = useMemo(() => {
        if (
            ReportUtils.isChatRoom(report) ||
            ReportUtils.isPolicyExpenseChat(report) ||
            ReportUtils.isChatThread(report) ||
            ReportUtils.isTaskReport(report) ||
            ReportUtils.isMoneyRequestReport(report) ||
            isGroupChat
        ) {
            return translate('common.members');
        }
        return translate('common.details');
    }, [report, translate, isGroupChat]);

    const selectionModeHeader = selectionMode?.isEnabled && isSmallScreenWidth;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const memberNotFoundMessage = isGroupChat
        ? `${translate('roomMembersPage.memberNotFound')} ${translate('roomMembersPage.useInviteButton')}`
        : translate('roomMembersPage.memberNotFound');
    const headerMessage = searchValue.trim() && !participants.length ? memberNotFoundMessage : '';

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={ReportParticipantsPage.displayName}
        >
            <FullPageNotFoundView shouldShow={!report || ReportUtils.isArchivedRoom(report, reportNameValuePairs) || ReportUtils.isSelfDM(report)}>
                <HeaderWithBackButton
                    title={selectionModeHeader ? translate('common.selectMultiple') : headerTitle}
                    onBackButtonPress={() => {
                        if (selectionMode?.isEnabled) {
                            setSelectedMembers([]);
                            turnOffMobileSelectionMode();
                            return;
                        }

                        if (report) {
                            setSearchValue('');
                            Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
                        }
                    }}
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                />
                <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>
                <ConfirmModal
                    danger
                    title={translate('workspace.people.removeMembersTitle')}
                    isVisible={removeMembersConfirmModalVisible}
                    onConfirm={removeUsers}
                    onCancel={() => setRemoveMembersConfirmModalVisible(false)}
                    prompt={translate('workspace.people.removeMembersPrompt')}
                    confirmText={translate('common.remove')}
                    cancelText={translate('common.cancel')}
                    onModalHide={() => {
                        InteractionManager.runAfterInteractions(() => {
                            if (!textInputRef.current) {
                                return;
                            }
                            textInputRef.current.focus();
                        });
                    }}
                />
                <View style={[styles.w100, isGroupChat ? styles.mt3 : styles.mt0, styles.flex1]}>
                    <SelectionListWithModal
                        ref={selectionListRef}
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress={isCurrentUserAdmin && isGroupChat}
                        onTurnOnSelectionMode={(item) => item && toggleUser(item)}
                        sections={[{data: participants}]}
                        shouldShowTextInput={shouldShowTextInput}
                        textInputLabel={translate('selectionList.findMember')}
                        textInputValue={searchValue}
                        onChangeText={(value) => {
                            setSearchValue(value);
                        }}
                        headerMessage={headerMessage}
                        ListItem={TableListItem}
                        onSelectRow={openMemberDetails}
                        shouldSingleExecuteRowSelect={!(isGroupChat && isCurrentUserAdmin)}
                        onCheckboxPress={(item) => toggleUser(item)}
                        onSelectAll={() => toggleAllUsers(participants)}
                        showScrollIndicator
                        textInputRef={textInputRef}
                        customListHeader={customListHeader}
                        listHeaderWrapperStyle={[styles.ph9, styles.mt3]}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportParticipantsPage.displayName = 'ReportParticipantsPage';

export default withReportOrNotFound()(ReportParticipantsPage);
