import ActivityIndicator from '@components/ActivityIndicator';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, RoomMemberBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import type {TableHandle} from '@components/Table';
import type {RoomMemberRowData, RoomMembersTableColumnKey} from '@components/Tables/RoomMembersTable';
import RoomMembersTable from '@components/Tables/RoomMembersTable';

import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useFilteredSelection from '@hooks/useFilteredSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useThemeStyles from '@hooks/useThemeStyles';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {clearUserSearchPhrase, updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RoomMembersNavigatorParamList} from '@libs/Navigation/types';
import {isPersonalDetailsReady} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {isPolicyAdmin, isPolicyEmployee as isPolicyEmployeeUtils} from '@libs/PolicyUtils';
import {getReportAction} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {
    getReportForHeader,
    getReportPersonalDetailsParticipants,
    isChatThread,
    isDefaultRoom,
    isPolicyExpenseChat as isPolicyExpenseChatUtils,
    isUserCreatedPolicyRoom,
} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';

import {clearAddRoomMemberError, openRoomMembersPage, removeFromRoom} from '@userActions/Report';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {PersonalDetails} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type DynamicRoomMembersPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.DYNAMIC_ROOT>;

function DynamicRoomMembersPage({report, policy}: DynamicRoomMembersPageProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.ROOM_MEMBERS.path);
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'RemoveMembers']);
    const reportAction = useMemo(() => getReportAction(report?.parentReportID, report?.parentReportActionID), [report?.parentReportID, report?.parentReportActionID]);
    const shouldParserToHTML = reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;
    const styles = useThemeStyles();
    const reportAttributes = useReportAttributes();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`);
    const {formatPhoneNumber, translate, localeCompare} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE);
    const [didLoadRoomMembers, setDidLoadRoomMembers] = useState(false);
    const personalDetails = usePersonalDetails();
    const isPolicyExpenseChat = useMemo(() => isPolicyExpenseChatUtils(report), [report]);
    const tableRef = useRef<TableHandle<RoomMemberRowData, RoomMembersTableColumnKey, string>>(null);
    const navigateBackToReportDetails = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);
    const isReportArchived = useReportIsArchived(report.reportID);
    const reportForSubtitle = useMemo(() => getReportForHeader(report), [report]);

    const {chatParticipants: participants, personalDetailsParticipants} = useMemo(
        () => getReportPersonalDetailsParticipants(report, personalDetails, reportMetadata, true),
        [report, personalDetails, reportMetadata],
    );

    const shouldIncludeMember = useCallback(
        (participant?: PersonalDetails) => {
            if (!participant) {
                return false;
            }
            const isInParticipants = participants.includes(participant.accountID);
            const pendingChatMember = reportMetadata?.pendingChatMembers?.find((member) => member.accountID === participant.accountID.toString());

            const isPendingDelete = pendingChatMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            return isInParticipants && !isPendingDelete;
        },
        [participants, reportMetadata?.pendingChatMembers],
    );

    const [selectedMembers, setSelectedMembers] = useFilteredSelection(personalDetailsParticipants, shouldIncludeMember);
    const firstSelectedMember = selectedMembers?.at(0);
    const [firstSelectedMemberDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsSelector(firstSelectedMember),
    });

    const clearTableSelection = useCallback(() => {
        setSelectedMembers((prevSelectedMembers) => (prevSelectedMembers.length > 0 ? [] : prevSelectedMembers));
    }, [setSelectedMembers]);

    // The Table stores selection as string keys, while this page tracks accountIDs as numbers.
    const onRowSelectionChange = useCallback(
        (keys: string[]) => {
            setSelectedMembers(keys.map(Number));
        },
        [setSelectedMembers],
    );

    useCleanupSelectedOptions(clearTableSelection);

    const isFocusedScreen = useIsFocused();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the selection mode only on small screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const canSelectMultiple = isSmallScreenWidth ? isMobileSelectionModeEnabled : true;
    const isLoading = !isPersonalDetailsReady(personalDetails) || !didLoadRoomMembers;

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearTableSearch = useCallback(() => {
        tableRef.current?.updateSearchString('');
    }, []);

    const inviteUser = useCallback(() => {
        if (!report) {
            return;
        }
        clearTableSearch();
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ROOM_INVITE.path));
    }, [clearTableSearch, report]);

    const removeUsers = useCallback(() => {
        if (report) {
            removeFromRoom(report, selectedMembers);
        }
        clearTableSearch();
        clearTableSelection();
        clearUserSearchPhrase();
    }, [clearTableSearch, clearTableSelection, report, selectedMembers]);

    const showRemoveMembersModal = useCallback(async () => {
        const {action} = await showConfirmModal({
            title: translate('workspace.people.removeMembersTitle', {
                count: selectedMembers.length,
            }),
            prompt: translate('roomMembersPage.removeMembersPrompt', {
                count: selectedMembers.length,
                memberName: formatPhoneNumber(firstSelectedMemberDetails?.displayName ?? ''),
            }),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
            danger: true,
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        removeUsers();
    }, [showConfirmModal, translate, selectedMembers.length, formatPhoneNumber, firstSelectedMemberDetails?.displayName, removeUsers]);

    useSearchBackPress({
        onClearSelection: clearTableSelection,
        onNavigationCallBack: () => {
            clearTableSearch();
            navigateBackToReportDetails();
        },
    });

    const openRoomMemberDetails = useCallback((accountID: number) => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ROOM_MEMBER_DETAILS.getRoute(accountID)));
    }, []);

    const members = useMemo<RoomMemberRowData[]>(() => {
        const result: RoomMemberRowData[] = [];

        for (const accountID of participants) {
            const details = personalDetails?.[accountID];
            if (!details) {
                continue;
            }
            const pendingChatMember = reportMetadata?.pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
            const isAdmin = isPolicyAdmin(policy, details.login);
            const isDisabled = pendingChatMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || details.isOptimisticPersonalDetail;
            const isSelectionDisabled =
                (isPolicyExpenseChat && isAdmin) ||
                accountID === session?.accountID ||
                pendingChatMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                details.accountID === report.ownerAccountID;

            result.push({
                keyForList: String(accountID),
                accountID,
                login: details.login ?? '',
                name: formatPhoneNumber(
                    temporaryGetDisplayNameOrDefault({
                        passedPersonalDetails: details,
                        translate,
                    }),
                ),
                email: formatPhoneNumber(details.login ?? ''),
                disabled: isDisabled,
                isSelectionDisabled,
                pendingAction: pendingChatMember?.pendingAction,
                errors: pendingChatMember?.errors,
                action: () => openRoomMemberDetails(accountID),
                dismissError: () => clearAddRoomMemberError(report.reportID, String(accountID)),
            });
        }

        return result.sort((value1, value2) => localeCompare(value1.name.toLowerCase(), value2.name.toLowerCase()));
    }, [
        formatPhoneNumber,
        isPolicyExpenseChat,
        localeCompare,
        openRoomMemberDetails,
        participants,
        personalDetails,
        policy,
        report.ownerAccountID,
        report.reportID,
        reportMetadata?.pendingChatMembers,
        session?.accountID,
        translate,
    ]);

    useEffect(() => {
        if (!isFocusedScreen || members.length === 0 || isLoading) {
            return;
        }

        const phrase = userSearchPhrase ?? '';
        const currentSearchString = tableRef.current?.getActiveSearchString?.() ?? '';

        if (currentSearchString === phrase) {
            return;
        }

        tableRef.current?.updateSearchString(phrase);
    }, [isFocusedScreen, isLoading, members.length, userSearchPhrase]);

    useEffect(() => {
        if (!isFocusedScreen) {
            return;
        }
        if (members.length === 0) {
            clearUserSearchPhrase();
            clearTableSearch();
        }
    }, [clearTableSearch, isFocusedScreen, members.length]);

    const selectedKeys = selectedMembers.map(String);

    const isPolicyEmployee = useMemo(() => isPolicyEmployeeUtils(report.policyID, policy), [report?.policyID, policy]);

    const bulkActionsButtonOptions = useMemo(() => {
        const options: Array<DropdownOption<RoomMemberBulkActionType>> = [
            {
                text: translate('workspace.people.removeMembersTitle', {
                    count: selectedMembers.length,
                }),
                value: CONST.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: icons.RemoveMembers,
                onSelected: showRemoveMembersModal,
            },
        ];
        return options;
    }, [icons.RemoveMembers, translate, selectedMembers.length, showRemoveMembersModal]);

    const headerButtons = useMemo(() => {
        return (
            <View style={styles.w100}>
                {(isSmallScreenWidth ? canSelectMultiple : selectedMembers.length > 0) ? (
                    <ButtonWithDropdownMenu<RoomMemberBulkActionType>
                        shouldAlwaysShowDropdownMenu
                        pressOnEnter
                        customText={translate('workspace.common.selected', {
                            count: selectedMembers.length,
                        })}
                        buttonSize={CONST.BUTTON_SIZE.MEDIUM}
                        onPress={() => null}
                        options={bulkActionsButtonOptions}
                        isSplitButton={false}
                        style={[shouldUseNarrowLayout && styles.flexGrow1, styles.mb5]}
                        isDisabled={!selectedMembers.length}
                    />
                ) : (
                    <Button
                        success
                        onPress={inviteUser}
                        text={translate('workspace.invite.member')}
                        icon={icons.Plus}
                        innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                        style={[shouldUseNarrowLayout && styles.flexGrow1, styles.mb5]}
                    />
                )}
            </View>
        );
    }, [bulkActionsButtonOptions, inviteUser, isSmallScreenWidth, selectedMembers.length, styles, translate, canSelectMultiple, shouldUseNarrowLayout, icons.Plus]);

    const selectionModeHeader = isMobileSelectionModeEnabled && isSmallScreenWidth;
    const reasonAttributes = {
        context: 'DynamicRoomMembersPage',
        didLoadRoomMembers,
        isPersonalDetailsReady: isPersonalDetailsReady(personalDetails),
    };

    let subtitleKey: '' | TranslationPaths | undefined;
    if (!isEmptyObject(report)) {
        subtitleKey = isReportArchived ? 'roomMembersPage.roomArchived' : 'roomMembersPage.notAuthorized';
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID="DynamicRoomMembersPage"
        >
            <FullPageNotFoundView
                shouldShow={isEmptyObject(report) || isReportArchived || (!isChatThread(report) && ((isUserCreatedPolicyRoom(report) && !isPolicyEmployee) || isDefaultRoom(report)))}
                subtitleKey={subtitleKey}
                onBackButtonPress={navigateBackToReportDetails}
            >
                <HeaderWithBackButton
                    title={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.members')}
                    subtitle={StringUtils.lineBreaksToSpaces(
                        shouldParserToHTML ? Parser.htmlToText(getReportName(reportForSubtitle, reportAttributes)) : getReportName(reportForSubtitle, reportAttributes),
                    )}
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            clearTableSelection();
                            turnOffMobileSelectionMode();
                            return;
                        }

                        clearTableSearch();
                        navigateBackToReportDetails();
                    }}
                />
                <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>
                {isLoading ? (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        reasonAttributes={reasonAttributes}
                    />
                ) : (
                    <View style={[styles.w100, styles.flex1]}>
                        <RoomMembersTable
                            ref={tableRef}
                            members={members}
                            selectionEnabled
                            selectedKeys={selectedKeys}
                            onRowSelectionChange={onRowSelectionChange}
                            onSearchStringChange={updateUserSearchPhrase}
                        />
                    </View>
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicRoomMembersPage);
