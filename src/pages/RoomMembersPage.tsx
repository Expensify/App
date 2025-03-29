import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, RoomMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar, Plus, RemoveMembers} from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {clearUserSearchPhrase, updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RoomMembersNavigatorParamList} from '@libs/Navigation/types';
import {isPersonalDetailsReady, isSearchStringMatchUserDetails} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault, getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {isPolicyEmployee as isPolicyEmployeeUtils, isUserPolicyAdmin} from '@libs/PolicyUtils';
import {getParticipantsList, getReportName, isChatThread, isDefaultRoom, isPolicyExpenseChat as isPolicyExpenseChatUtils, isUserCreatedPolicyRoom} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {clearAddRoomMemberError, openRoomMembersPage, removeFromRoom} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type RoomMembersPageProps = WithReportOrNotFoundProps & WithCurrentUserPersonalDetailsProps & PlatformStackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.ROOT>;

function RoomMembersPage({report, policies}: RoomMembersPageProps) {
    const route = useRoute<PlatformStackRouteProp<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.ROOT>>();
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`);
    const currentUserAccountID = Number(session?.accountID);
    const {formatPhoneNumber, translate} = useLocalize();
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [removeMembersConfirmModalVisible, setRemoveMembersConfirmModalVisible] = useState(false);
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE);
    const [searchValue, setSearchValue] = useState('');
    const [didLoadRoomMembers, setDidLoadRoomMembers] = useState(false);
    const personalDetails = usePersonalDetails();
    const policy = useMemo(() => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`], [policies, report?.policyID]);
    const isPolicyExpenseChat = useMemo(() => isPolicyExpenseChatUtils(report), [report]);
    const backTo = route.params.backTo;

    const isFocusedScreen = useIsFocused();
    const {isOffline} = useNetwork();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the selection mode only on small screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);
    const canSelectMultiple = isSmallScreenWidth ? selectionMode?.isEnabled : true;

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
        openRoomMembersPage(report.reportID);
        setDidLoadRoomMembers(true);
    }, [report]);

    useEffect(() => {
        clearUserSearchPhrase();
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
            removeFromRoom(report.reportID, selectedMembers);
        }
        setSearchValue('');
        setSelectedMembers([]);
        setRemoveMembersConfirmModalVisible(false);
        InteractionManager.runAfterInteractions(() => {
            clearUserSearchPhrase();
        });
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
        const enabledAccounts = memberList.filter((member) => !member.isDisabled && !member.isDisabledCheckbox);
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

    const participants = useMemo(() => getParticipantsList(report, personalDetails, true), [report, personalDetails]);

    /** Include the search bar when there are 8 or more active members in the selection list */
    const shouldShowTextInput = useMemo(() => {
        // Get the active chat members by filtering out the pending members with delete action
        const activeParticipants = participants.filter((accountID) => {
            const pendingMember = reportMetadata?.pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
            if (!personalDetails?.[accountID]) {
                return false;
            }
            // When offline, we want to include the pending members with delete action as they are displayed in the list as well
            return !pendingMember || isOffline || pendingMember.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        });
        return activeParticipants.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    }, [participants, reportMetadata?.pendingChatMembers, personalDetails, isOffline]);

    useEffect(() => {
        if (!isFocusedScreen || !shouldShowTextInput) {
            return;
        }
        setSearchValue(userSearchPhrase ?? '');
    }, [isFocusedScreen, shouldShowTextInput, userSearchPhrase]);

    useEffect(() => {
        updateUserSearchPhrase(searchValue);
    }, [searchValue]);

    useEffect(() => {
        if (!isFocusedScreen) {
            return;
        }
        if (shouldShowTextInput) {
            setSearchValue(userSearchPhrase ?? '');
        } else {
            clearUserSearchPhrase();
            setSearchValue('');
        }
    }, [isFocusedScreen, setSearchValue, shouldShowTextInput, userSearchPhrase]);

    useSearchBackPress({
        onClearSelection: () => setSelectedMembers([]),
        onNavigationCallBack: () => {
            setSearchValue('');
            Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
        },
    });

    const data = useMemo((): ListItem[] => {
        let result: ListItem[] = [];

        participants.forEach((accountID) => {
            const details = personalDetails?.[accountID];

            // If search value is provided, filter out members that don't match the search value
            if (!details || (searchValue.trim() && !isSearchStringMatchUserDetails(details, searchValue))) {
                return;
            }
            const pendingChatMember = reportMetadata?.pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
            const isAdmin = isUserPolicyAdmin(policy, details.login);
            const isDisabled = pendingChatMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || details.isOptimisticPersonalDetail;
            const isDisabledCheckbox =
                (isPolicyExpenseChat && isAdmin) ||
                accountID === session?.accountID ||
                pendingChatMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                details.accountID === report.ownerAccountID;

            result.push({
                keyForList: String(accountID),
                accountID,
                isSelected: selectedMembers.includes(accountID),
                isDisabled,
                isDisabledCheckbox,
                text: formatPhoneNumber(getDisplayNameOrDefault(details)),
                alternateText: details?.login ? formatPhoneNumber(details.login) : '',
                icons: [
                    {
                        source: details.avatar ?? FallbackAvatar,
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
    }, [
        formatPhoneNumber,
        isPolicyExpenseChat,
        participants,
        personalDetails,
        policy,
        report.ownerAccountID,
        reportMetadata?.pendingChatMembers,
        searchValue,
        selectedMembers,
        session?.accountID,
    ]);

    const dismissError = useCallback(
        (item: ListItem) => {
            clearAddRoomMemberError(report.reportID, String(item.accountID));
        },
        [report.reportID],
    );

    const isPolicyEmployee = useMemo(() => {
        if (!report?.policyID || policies === null) {
            return false;
        }
        return isPolicyEmployeeUtils(report.policyID, policies);
    }, [report?.policyID, policies]);

    const headerMessage = searchValue.trim() && !data.length ? `${translate('roomMembersPage.memberNotFound')} ${translate('roomMembersPage.useInviteButton')}` : '';

    const bulkActionsButtonOptions = useMemo(() => {
        const options: Array<DropdownOption<RoomMemberBulkActionType>> = [
            {
                text: translate('workspace.people.removeMembersTitle', {count: selectedMembers.length}),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: RemoveMembers,
                onSelected: () => setRemoveMembersConfirmModalVisible(true),
            },
        ];
        return options;
    }, [translate, selectedMembers.length]);

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
                        icon={Plus}
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
            if (!item?.accountID) {
                return;
            }

            Navigation.navigate(ROUTES.ROOM_MEMBER_DETAILS.getRoute(report.reportID, item?.accountID, backTo));
        },
        [report, backTo],
    );
    const selectionModeHeader = selectionMode?.isEnabled && isSmallScreenWidth;

    const customListHeader = useMemo(() => {
        const header = (
            <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween]}>
                <View>
                    <Text style={[styles.textMicroSupporting, canSelectMultiple ? styles.ml3 : styles.ml0]}>{translate('common.member')}</Text>
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
                shouldShow={isEmptyObject(report) || (!isChatThread(report) && ((isUserCreatedPolicyRoom(report) && !isPolicyEmployee) || isDefaultRoom(report)))}
                subtitleKey={isEmptyObject(report) ? undefined : 'roomMembersPage.notAuthorized'}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
                }}
            >
                <HeaderWithBackButton
                    title={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.members')}
                    subtitle={StringUtils.lineBreaksToSpaces(getReportName(report))}
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
                    title={translate('workspace.people.removeMembersTitle', {count: selectedMembers.length})}
                    isVisible={removeMembersConfirmModalVisible}
                    onConfirm={removeUsers}
                    onCancel={() => setRemoveMembersConfirmModalVisible(false)}
                    prompt={translate('roomMembersPage.removeMembersPrompt', {
                        count: selectedMembers.length,
                        memberName: formatPhoneNumber(getPersonalDetailsByIDs({accountIDs: selectedMembers, currentUserAccountID}).at(0)?.displayName ?? ''),
                    })}
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
                        onChangeText={setSearchValue}
                        headerMessage={headerMessage}
                        turnOnSelectionModeOnLongPress
                        onTurnOnSelectionMode={(item) => item && toggleUser(item)}
                        onCheckboxPress={(item) => toggleUser(item)}
                        onSelectRow={openRoomMemberDetails}
                        onSelectAll={() => toggleAllUsers(data)}
                        showLoadingPlaceholder={!isPersonalDetailsReady(personalDetails) || !didLoadRoomMembers}
                        showScrollIndicator
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
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

export default withReportOrNotFound()(withCurrentUserPersonalDetails(RoomMembersPage));
