import React, {useCallback, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {TextInput} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Session} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import variables from '@styles/variables';

type ReportParticipantsPageOnyxProps = {
    /** Personal details of all the users */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type ReportParticipantsPageProps = ReportParticipantsPageOnyxProps & WithReportOrNotFoundProps;

type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};

function ReportParticipantsPage({report, personalDetails, session}: ReportParticipantsPageProps) {
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [errors, setErrors] = useState({});
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const selectionListRef = useRef<SelectionListHandle>(null);
    const textInputRef = useRef<TextInput>(null);
    const dropdownButtonRef = useRef(null);
    const getUsers = useCallback((): MemberOption[] => {
        let result: MemberOption[] = [];
        ReportUtils.getVisibleChatMemberAccountIDs(report.reportID).forEach((accountID) => {
            const role = report.participants?.[accountID].role;
            const details = personalDetails?.[accountID];

            if (!details) {
                Log.hmmm(`[WorkspaceMembersPage] no personal details found for policy member with accountID: ${accountID}`);
                return;
            }

            const isSelected = selectedMembers.includes(accountID);
            const isAdmin = role === CONST.REPORT.ROLE.ADMIN;
            let roleBadge = null;
            if (isAdmin) {
                roleBadge = (
                    <Badge
                        text={translate('common.admin')}
                        textStyles={[styles.badgeText, styles.textStrong, variables.fontSizeNormal]}
                        badgeStyles={[styles.justifyContentCenter, styles.badgeSmall]}
                    />
                );
            }

            result.push({
                keyForList: `${accountID}`,
                accountID,
                isSelected,
                isDisabledCheckbox: accountID === session?.accountID,
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
            });
        });

        result = result.sort((a, b) => (a.text ?? '').toLowerCase().localeCompare((b.text ?? '').toLowerCase()));

        return result;
    }, [
        formatPhoneNumber,
        personalDetails,
        report,
        selectedMembers,
        session?.accountID,
        translate,
        styles,
    ]);

    const participants = useMemo(() => getUsers(), [getUsers]);

    /**
     * Check if the current selection includes members that cannot be removed
     */
    const validateSelection = useCallback(() => {
        const newErrors: Errors = {};
        selectedMembers.forEach((member) => {
            if (member !== session?.accountID) {
                return;
            }
            newErrors[member] = translate('workspace.people.error.cannotRemove');
        });
        setErrors(newErrors);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMembers, session?.accountID]);

    /**
     * Add user from the selectedMembers list
     */
    const addUser = useCallback(
        (accountID: number) => {
            setSelectedMembers((prevSelected) => [...prevSelected, accountID]);
            validateSelection();
        },
        [validateSelection],
    );

    /**
     * Show the modal to confirm removal of the selected members
     */
    const askForConfirmationToRemove = () => {
        if (!isEmptyObject(errors)) {
            return;
        }
        setRemoveMembersConfirmModalVisible(true);
    };

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

        validateSelection();
    };

    /**
     * Remove user from the selectedMembers list
     */
    const removeUser = useCallback(
        (accountID: number) => {
            setSelectedMembers((prevSelected) => prevSelected.filter((id) => id !== accountID));
            validateSelection();
        },
        [validateSelection],
    );

    /**
     * Open the modal to invite a user
     */
    const inviteUser = () => {
        Navigation.navigate(ROUTES.REPORT_PARTICIPANTS_INVITE.getRoute(report.reportID));
    };

    /**
     * Remove selected users from the workspace
     * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
     */
    const removeUsers = () => {
        if (!isEmptyObject(errors)) {
            return;
        }

        // Remove the admin from the list
        // const accountIDsToRemove = session?.accountID ? selectedMembers.filter((id) => id !== session.accountID) : selectedMembers;

        // Policy.removeMembers(accountIDsToRemove, route.params.policyID);
        setSelectedMembers([]);
        setRemoveMembersConfirmModalVisible(false);
    };

    const changeUserRole = (role: typeof CONST.REPORT.ROLE.ADMIN) => {
        if (!isEmptyObject(errors)) {
            return;
        }

        // const accountIDsToUpdate = selectedMembers.filter((id) => report.participants?.[id].role !== role);
        // Policy.updateWorkspaceMembersRole(route.params.policyID, accountIDsToUpdate, role);
        setSelectedMembers([]);
    };

    /**
     * Toggle user from the selectedMembers list
     */
    const toggleUser = useCallback(
        (accountID: number) => {
            // Add or remove the user if the checkbox is enabled
            if (selectedMembers.includes(accountID)) {
                removeUser(accountID);
            } else {
                addUser(accountID);
            }
        },
        [selectedMembers, addUser, removeUser],
    );

    const getHeaderContent = () => {
        if (!ReportUtils.isGroupChat(report)) {
            return;
        }
        return <Text style={[styles.pl5, styles.mb4, styles.mt3, styles.textSupporting]}>{translate('groupPage.people.groupMembersListTitle')}</Text>;
    };

    const getCustomListHeader = () => {
        if (!ReportUtils.isGroupChat(report)) {
            return;
        }
        const header = (
            <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween]}>
                <View>
                    <Text style={[styles.searchInputStyle, styles.ml3]}>{translate('common.member')}</Text>
                </View>
                <View style={[StyleUtils.getMinimumWidth(60)]}>
                    <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('common.role')}</Text>
                </View>
            </View>
        );

        return <View style={[styles.peopleRow, styles.userSelectNone, styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
    };

    const getBulkActionsButtonOptions = () => {
        const options: Array<DropdownOption<WorkspaceMemberBulkActionType>> = [
            {
                text: translate('workspace.people.removeMembersTitle'),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: Expensicons.RemoveMembers,
                onSelected: askForConfirmationToRemove,
            },
            {
                text: translate('workspace.people.makeAdmin'),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_ADMIN,
                icon: Expensicons.MakeAdmin,
                onSelected: () => changeUserRole(CONST.REPORT.ROLE.ADMIN),
            },
        ];

        return options;
    };

    const getHeaderButtons = () => {
        if (!ReportUtils.isGroupChat(report)) {
            return;
        }

        return (
            <View style={styles.w100}>
                {selectedMembers.length > 0 ? (
                    <ButtonWithDropdownMenu<WorkspaceMemberBulkActionType>
                        shouldAlwaysShowDropdownMenu
                        pressOnEnter
                        customText={translate('workspace.common.selected', {selectedNumber: selectedMembers.length})}
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                        onPress={() => null}
                        options={getBulkActionsButtonOptions()}
                        buttonRef={dropdownButtonRef}
                        style={[isSmallScreenWidth && styles.flexGrow1]}
                    />
                ) : (
                    <Button
                        medium
                        success
                        onPress={inviteUser}
                        text={translate('workspace.invite.member')}
                        icon={Expensicons.Plus}
                        innerStyles={[isSmallScreenWidth && styles.alignItemsCenter]}
                        style={[isSmallScreenWidth && styles.flexGrow1]}
                    />
                )}
            </View>
        );
    };

    /** Opens the member details page */
    const openMemberDetails = useCallback(
        (item: MemberOption) => {
            if (ReportUtils.isGroupChat(report)) {
                Navigation.navigate(ROUTES.REPORT_PARTICIPANTS_DETAILS.getRoute(report.reportID, item.accountID, Navigation.getActiveRoute()));
                return;
            }
            Navigation.navigate(ROUTES.PROFILE.getRoute(item.accountID));
        },
        [report],
    );
    const headerTitle = useMemo(() => {
        if (ReportUtils.isChatRoom(report) ||
            ReportUtils.isPolicyExpenseChat(report) ||
            ReportUtils.isChatThread(report) ||
            ReportUtils.isTaskReport(report) ||
            ReportUtils.isMoneyRequestReport(report))
        {
            return translate('common.members');
        }
        if (ReportUtils.isGroupChat(report)) {
            return 'Everyone';
        }

        return translate('common.details');
    }, [report, translate]);
    const isGroupChat = useMemo(() => ReportUtils.isGroupChat(report), [report]);
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={ReportParticipantsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView shouldShow={!report || ReportUtils.isArchivedRoom(report) || ReportUtils.isSelfDM(report)}>
                <HeaderWithBackButton
                    title={headerTitle}
                    subtitle={isGroupChat ? translate('common.members') : ''}
                    icon={isGroupChat ? Illustrations.ReceiptWrangler : undefined}
                    onBackButtonPress={report ? () => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID)) : undefined}
                    shouldShowBackButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                    subtitleOnTop={isGroupChat}
                >
                    {!isSmallScreenWidth && getHeaderButtons()}
                </HeaderWithBackButton>
                {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
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
                <View style={[styles.w100, styles.flex1]}>
                    <SelectionList
                        ref={selectionListRef}
                        canSelectMultiple={ReportUtils.isGroupChat(report)}
                        sections={[{data: participants}]}
                        ListItem={TableListItem}
                        // disableKeyboardShortcuts={removeMembersConfirmModalVisible}
                        // headerMessage={getHeaderMessage()}
                        headerContent={getHeaderContent()}
                        onSelectRow={openMemberDetails}
                        onCheckboxPress={(item) => toggleUser(item.accountID)}
                        onSelectAll={() => toggleAllUsers(participants)}
                        // onDismissError={dismissError}
                        // showLoadingPlaceholder={isLoading}
                        showScrollIndicator
                        // shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        textInputRef={textInputRef}
                        customListHeader={getCustomListHeader()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportParticipantsPage.displayName = 'ReportParticipantsPage';

export default withReportOrNotFound()(
    withOnyx<ReportParticipantsPageProps, ReportParticipantsPageOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(ReportParticipantsPage),
);
