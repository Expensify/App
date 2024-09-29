import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, RoomMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import * as UserSearchPhraseActions from '@libs/actions/RoomMembersUserSearchPhrase';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RoomMembersNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Session} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type RoomMembersPageOnyxProps = {
    session: OnyxEntry<Session>;
};

type RoomMembersPageProps = WithReportOrNotFoundProps &
    WithCurrentUserPersonalDetailsProps &
    RoomMembersPageOnyxProps &
    PlatformStackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.ROOT>;

function RoomMembersPage({report, session, policies}: RoomMembersPageProps) {
    const route = useRoute<PlatformStackRouteProp<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.ROOT>>();
    const styles = useThemeStyles();
    const {formatPhoneNumber, translate} = useLocalize();
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE);
    const [searchValue, debouncedSearchTerm, setSearchValue] = useDebouncedState('');
    const [didLoadRoomMembers, setDidLoadRoomMembers] = useState(false);
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const policy = useMemo(() => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? ''}`], [policies, report?.policyID]);
    const isPolicyExpenseChat = useMemo(() => ReportUtils.isPolicyExpenseChat(report), [report]);
    const backTo = route.params.backTo;

    const isFocusedScreen = useIsFocused();
    const {isOffline} = useNetwork();

    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);
    const canSelectMultiple = isSmallScreenWidth ? selectionMode?.isEnabled : true;

    useEffect(() => {
        setSearchValue(userSearchPhrase ?? '');
    }, [isFocusedScreen, setSearchValue, userSearchPhrase]);

    useEffect(() => {
        UserSearchPhraseActions.updateUserSearchPhrase(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (isFocusedScreen) {
            return;
        }
        setSelectedMembers([]);
    }, [isFocusedScreen]);

    /**
     * Get members for the current room
     */
    const getRoomMembers = useCallback(() => {
        if (!report) {
            return;
        }
        Report.openRoomMembersPage(report.reportID);
        setDidLoadRoomMembers(true);
    }, [report]);

    useEffect(() => {
        UserSearchPhraseActions.clearUserSearchPhrase();
        getRoomMembers();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    /**
     * Open the modal to invite a user
     */
    const inviteUser = useCallback(() => {
        if (!report) {
            return;
        }
        setSearchValue('');
        Navigation.navigate(ROUTES.ROOM_INVITE.getRoute(report.reportID, undefined, backTo));
    }, [report, setSearchValue, backTo]);

    /**
     * Remove selected users from the room
     * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
     */
    const removeUsers = () => {
        if (report) {
            Report.removeFromRoom(report.reportID, selectedMembers);
        }
        setSearchValue('');
        UserSearchPhraseActions.clearUserSearchPhrase();
        setSelectedMembers([]);
        setRemoveMembersConfirmModalVisible(false);
    };

    /**
     * Add user from the selectedMembers list
     */
    const addUser = useCallback((accountID: number) => {
        setSelectedMembers((prevSelected) => [...prevSelected, accountID]);
    }, []);

    /**
     * Remove user from the selectedEmployees list
     */
    const removeUser = useCallback((accountID: number) => {
        setSelectedMembers((prevSelected) => prevSelected.filter((selected) => selected !== accountID));
    }, []);

    /** Toggle user from the selectedMembers list */
    const toggleUser = useCallback(
        ({accountID, pendingAction}: ListItem) => {
            if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !accountID) {
                return;
            }

            // Add or remove the user if the checkbox is enabled
            if (selectedMembers.includes(accountID)) {
                removeUser(accountID);
            } else {
                addUser(accountID);
            }
        },
        [selectedMembers, addUser, removeUser],
    );

    /** Add or remove all users passed from the selectedMembers list */
    const toggleAllUsers = (memberList: ListItem[]) => {
        const enabledAccounts = memberList.filter((member) => !member.isDisabled);
        const everyoneSelected = enabledAccounts.every((member) => {
            if (!member.accountID) {
                return false;
            }
            return selectedMembers.includes(member.accountID);
        });

        if (everyoneSelected) {
            setSelectedMembers([]);
        } else {
            const everyAccountId = enabledAccounts.map((member) => member.accountID).filter((accountID): accountID is number => !!accountID);
            setSelectedMembers(everyAccountId);
        }
    };

    const participants = useMemo(() => ReportUtils.getParticipantsList(report, personalDetails, true), [report, personalDetails]);

    /** Include the search bar when there are 8 or more active members in the selection list */
    const shouldShowTextInput = useMemo(() => {
        // Get the active chat members by filtering out the pending members with delete action
        const activeParticipants = participants.filter((accountID) => {
            const pendingMember = report?.pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
            if (!personalDetails?.[accountID]) {
                return false;
            }
            // When offline, we want to include the pending members with delete action as they are displayed in the list as well
            return !pendingMember || isOffline || pendingMember.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        });
        return activeParticipants.length >= CONST.SHOULD_SHOW_MEMBERS_SEARCH_INPUT_BREAKPOINT;
    }, [participants, personalDetails, isOffline, report]);

    useEffect(() => {
        if (!isFocusedScreen) {
            return;
        }
        if (shouldShowTextInput) {
            setSearchValue(userSearchPhrase ?? '');
        } else {
            UserSearchPhraseActions.clearUserSearchPhrase();
            setSearchValue('');
        }
    }, [isFocusedScreen, setSearchValue, shouldShowTextInput, userSearchPhrase]);

    const data = useMemo((): ListItem[] => {
        let result: ListItem[] = [];

        participants.forEach((accountID) => {
            const details = personalDetails[accountID];

            // If search value is provided, filter out members that don't match the search value
            if (!details || (searchValue.trim() && !OptionsListUtils.isSearchStringMatchUserDetails(details, searchValue))) {
                return;
            }
            const pendingChatMember = report?.pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
            const isAdmin = !!(policy && policy.employeeList && details.login && policy.employeeList[details.login]?.role === CONST.POLICY.ROLE.ADMIN);
            const isDisabled =
                (isPolicyExpenseChat && isAdmin) ||
                accountID === session?.accountID ||
                pendingChatMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                details.accountID === report.ownerAccountID ||
                details.isOptimisticPersonalDetail;

            result.push({
                keyForList: String(accountID),
                accountID,
                isSelected: selectedMembers.includes(accountID),
                isDisabled,
                text: formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
                alternateText: details?.login ? formatPhoneNumber(details.login) : '',
                icons: [
                    {
                        source: details.avatar ?? Expensicons.FallbackAvatar,
                        name: details.login ?? '',
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                pendingAction: pendingChatMember?.pendingAction,
                errors: pendingChatMember?.errors,
            });
        });

        result = result.sort((value1, value2) => localeCompare(value1.text ?? '', value2.text ?? ''));

        return result;
    }, [formatPhoneNumber, isPolicyExpenseChat, participants, personalDetails, policy, report.ownerAccountID, report?.pendingChatMembers, searchValue, selectedMembers, session?.accountID]);

    const dismissError = useCallback(
        (item: ListItem) => {
            Report.clearAddRoomMemberError(report.reportID, String(item.accountID ?? '-1'));
        },
        [report.reportID],
    );

    const isPolicyEmployee = useMemo(() => {
        if (!report?.policyID || policies === null) {
            return false;
        }
        return PolicyUtils.isPolicyEmployee(report.policyID, policies);
    }, [report?.policyID, policies]);

    const headerMessage = searchValue.trim() && !data.length ? `${translate('roomMembersPage.memberNotFound')} ${translate('roomMembersPage.useInviteButton')}` : '';

    const bulkActionsButtonOptions = useMemo(() => {
        const options: Array<DropdownOption<RoomMemberBulkActionType>> = [
            {
                text: translate('workspace.people.removeMembersTitle'),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: Expensicons.RemoveMembers,
                onSelected: () => setRemoveMembersConfirmModalVisible(true),
            },
        ];
        return options;
    }, [translate, setRemoveMembersConfirmModalVisible]);

    const headerButtons = useMemo(() => {
        return (
            <View style={styles.w100}>
                {(isSmallScreenWidth ? canSelectMultiple : selectedMembers.length > 0) ? (
                    <ButtonWithDropdownMenu<RoomMemberBulkActionType>
                        shouldAlwaysShowDropdownMenu
                        pressOnEnter
                        customText={translate('workspace.common.selected', {count: selectedMembers.length})}
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                        onPress={() => null}
                        options={bulkActionsButtonOptions}
                        isSplitButton={false}
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
    }, [bulkActionsButtonOptions, inviteUser, isSmallScreenWidth, selectedMembers, styles, translate, canSelectMultiple, shouldUseNarrowLayout]);

    /** Opens the room member details page */
    const openRoomMemberDetails = useCallback(
        (item: ListItem) => {
            Navigation.navigate(ROUTES.ROOM_MEMBER_DETAILS.getRoute(report.reportID, item?.accountID ?? -1, backTo));
        },
        [report, backTo],
    );
    const selectionModeHeader = selectionMode?.isEnabled && isSmallScreenWidth;

    const customListHeader = useMemo(() => {
        const header = (
            <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween]}>
                <View>
                    <Text style={[styles.searchInputStyle, canSelectMultiple ? styles.ml3 : styles.ml0]}>{translate('common.member')}</Text>
                </View>
            </View>
        );

        if (canSelectMultiple) {
            return header;
        }

        return <View style={[styles.peopleRow, styles.userSelectNone, styles.ph9, styles.pb5, styles.mt3]}>{header}</View>;
    }, [styles, translate, canSelectMultiple]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={RoomMembersPage.displayName}
        >
            <FullPageNotFoundView
                shouldShow={
                    isEmptyObject(report) || (!ReportUtils.isChatThread(report) && ((ReportUtils.isUserCreatedPolicyRoom(report) && !isPolicyEmployee) || ReportUtils.isDefaultRoom(report)))
                }
                subtitleKey={isEmptyObject(report) ? undefined : 'roomMembersPage.notAuthorized'}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
                }}
            >
                <HeaderWithBackButton
                    title={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.members')}
                    subtitle={StringUtils.lineBreaksToSpaces(ReportUtils.getReportName(report))}
                    onBackButtonPress={() => {
                        if (selectionMode?.isEnabled) {
                            setSelectedMembers([]);
                            turnOffMobileSelectionMode();
                            return;
                        }

                        setSearchValue('');
                        Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
                    }}
                />
                <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>
                <ConfirmModal
                    danger
                    title={translate('workspace.people.removeMembersTitle')}
                    isVisible={removeMembersConfirmModalVisible}
                    onConfirm={removeUsers}
                    onCancel={() => setRemoveMembersConfirmModalVisible(false)}
                    prompt={translate('roomMembersPage.removeMembersPrompt')}
                    confirmText={translate('common.remove')}
                    cancelText={translate('common.cancel')}
                />
                <View style={[styles.w100, styles.mt3, styles.flex1]}>
                    <SelectionListWithModal
                        canSelectMultiple={canSelectMultiple}
                        sections={[{data, isDisabled: false}]}
                        shouldShowTextInput={shouldShowTextInput}
                        textInputLabel={translate('selectionList.findMember')}
                        disableKeyboardShortcuts={removeMembersConfirmModalVisible}
                        textInputValue={searchValue}
                        onChangeText={(value) => {
                            setSearchValue(value);
                        }}
                        headerMessage={headerMessage}
                        turnOnSelectionModeOnLongPress
                        onTurnOnSelectionMode={(item) => item && toggleUser(item)}
                        onCheckboxPress={(item) => toggleUser(item)}
                        onSelectRow={openRoomMemberDetails}
                        onSelectAll={() => toggleAllUsers(data)}
                        showLoadingPlaceholder={!OptionsListUtils.isPersonalDetailsReady(personalDetails) || !didLoadRoomMembers}
                        showScrollIndicator
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        listHeaderWrapperStyle={[styles.ph9, styles.mt3]}
                        customListHeader={customListHeader}
                        ListItem={TableListItem}
                        onDismissError={dismissError}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

RoomMembersPage.displayName = 'RoomMembersPage';

export default withReportOrNotFound()(withCurrentUserPersonalDetails(withOnyx<RoomMembersPageProps, RoomMembersPageOnyxProps>({session: {key: ONYXKEYS.SESSION}})(RoomMembersPage)));
