import UserAvatar from '@components/Avatar/UserAvatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import type {PromotedAction} from '@components/PromotedActionsBar';
import PromotedActionsBar, {PromotedActions} from '@components/PromotedActionsBar';
import ReportHeaderAvatars from '@components/ReportHeaderAvatars';
import RoomHeaderAvatars from '@components/RoomHeaderAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import {SUPER_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';

import useAncestors from '@hooks/useAncestors';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useHasOutstandingChildTask from '@hooks/useHasOutstandingChildTask';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import {useDerivedReportNamesByReportIDs} from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';

import getBase62ReportID from '@libs/getBase62ReportID';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {ReportDetailsNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import Permissions from '@libs/Permissions';
import {isPolicyAdmin as isPolicyAdminUtil, isPolicyEmployee as isPolicyEmployeeUtil} from '@libs/PolicyUtils';
import {getOneTransactionThreadReportID, getOriginalMessage, isDeletedAction, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getReportNameFromNames} from '@libs/ReportAttributesUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {
    canDeleteCardTransactionByLiabilityType,
    canDeleteTransaction,
    canEditReportDescription as canEditReportDescriptionUtil,
    canEditReportTitle,
    canJoinChat,
    canWriteInReport,
    getAvailableReportFields,
    getChatRoomSubtitle,
    getIcons,
    getOriginalReportID,
    getParentNavigationSubtitle,
    getParticipantsList,
    getPolicyName,
    getReportDescription,
    getReportFieldKey,
    getReportForHeader,
    isArchivedNonExpenseReport,
    isCanceledTaskReport as isCanceledTaskReportUtil,
    isChatRoom as isChatRoomUtil,
    isChatThread as isChatThreadUtil,
    isClosedReport,
    isDefaultRoom as isDefaultRoomUtil,
    isExpenseReport as isExpenseReportUtil,
    isFinancialReportsForBusinesses as isFinancialReportsForBusinessesUtil,
    isGroupChat as isGroupChatUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isInvoiceRoom as isInvoiceRoomUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isMoneyRequest as isMoneyRequestUtil,
    isPolicyExpenseChat as isPolicyExpenseChatUtil,
    isReportFieldDisabled,
    isReportFieldOfTypeTitle,
    isRootGroupChat as isRootGroupChatUtil,
    isSelfDM as isSelfDMUtil,
    isSystemChat as isSystemChatUtil,
    isTaskReport as isTaskReportUtil,
    isThread as isThreadUtil,
    isTrackExpenseReportNew as isTrackExpenseReportUtil,
    isUserCreatedPolicyRoom as isUserCreatedPolicyRoomUtil,
    isWorkspaceChat as isWorkspaceChatUtil,
    navigateBackOnDeleteTransaction,
    shouldDisableRename as shouldDisableRenameUtil,
} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {getDeleteConfirmationPrompt, getDeleteExpenseTitle, getOriginalTransactionWithSplitInfo, isDemoTransaction} from '@libs/TransactionUtils';
import {getAccountIDFromAvatarID} from '@libs/UserAvatarUtils';

import {getNavigationUrlOnMoneyRequestDelete} from '@userActions/IOU/DeleteMoneyRequest';
import {deleteTrackExpense, getNavigationUrlAfterTrackExpenseDelete} from '@userActions/IOU/TrackExpense';
import {clearAvatarErrors, clearPolicyRoomNameErrors, getReportPrivateNote, setDeleteTransactionNavigateBackUrl, updateGroupChatAvatar} from '@userActions/Report';
import {canActionTask, canModifyTask, deleteTask} from '@userActions/Task';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {pendingDeleteMemberAccountIDsSelector} from '@src/selectors/ReportMetaData';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {StackActions} from '@react-navigation/native';
import {delegateEmailSelector} from '@selectors/Account';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';

import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

import ReportDetailsMenuItems from './inbox/report/ReportDetailsMenuItems';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type DynamicReportDetailsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>;

const CASES = {
    DEFAULT: 'default',
    MONEY_REQUEST: 'money_request',
    MONEY_REPORT: 'money_report',
};

type CaseID = ValueOf<typeof CASES>;

function DynamicReportDetailsPage({policy, report, route, reportMetadata, reportLoadingState}: DynamicReportDetailsPageProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Camera', 'Trashcan', 'ArrowSplit']);
    const navigateBackFromReportDetailsPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_DETAILS.path);
    const taskDeleteBackTo = Navigation.getTopmostSearchReportRouteParams()?.backTo;

    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`);

    const parentReportAction = useParentReportAction(report);
    const hasOutstandingChildTask = useHasOutstandingChildTask(report);

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [pendingDeleteMemberAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`, {selector: pendingDeleteMemberAccountIDsSelector});

    const {reportActions} = usePaginatedReportActions(report.reportID);
    const [reportActionsForOriginalReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`);
    // The report from which a tracked expense would be submitted/categorized/shared -
    // ReportDetailsMenuItems reads its actions to find the linked track-expense action
    const actionReportID = getOriginalReportID(report.reportID, parentReportAction, reportActionsForOriginalReportID);

    const {removeTransaction} = useSearchSelectionActions();

    const transactionThreadReportID = useMemo(() => getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline), [reportActions, isOffline, report, chatReport]);

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {showConfirmModal} = useConfirmModal();
    const reportForHeader = useMemo(() => getReportForHeader(report, parentReport), [report, parentReport]);
    const derivedReportNames = useDerivedReportNamesByReportIDs([report?.parentReportID, reportForHeader?.reportID]);
    const derivedParentReportName = getReportNameFromNames(derivedReportNames, report?.parentReportID);
    const derivedHeaderReportName = getReportNameFromNames(derivedReportNames, reportForHeader?.reportID);
    const isPolicyAdmin = useMemo(() => isPolicyAdminUtil(policy), [policy]);
    const isPolicyEmployee = useMemo(() => isPolicyEmployeeUtil(report?.policyID, policy), [report?.policyID, policy]);
    const isPolicyExpenseChat = useMemo(() => isPolicyExpenseChatUtil(report), [report]);
    const isChatRoom = useMemo(() => isChatRoomUtil(report), [report]);
    const isUserCreatedPolicyRoom = useMemo(() => isUserCreatedPolicyRoomUtil(report), [report]);
    const isDefaultRoom = useMemo(() => isDefaultRoomUtil(report), [report]);
    const isChatThread = useMemo(() => isChatThreadUtil(report), [report]);
    const isMoneyRequestReport = useMemo(() => isMoneyRequestReportUtil(report), [report]);
    const isMoneyRequest = useMemo(() => isMoneyRequestUtil(report), [report]);
    const isInvoiceReport = useMemo(() => isInvoiceReportUtil(report), [report]);
    const isFinancialReportsForBusinesses = useMemo(() => isFinancialReportsForBusinessesUtil(report), [report]);
    const isInvoiceRoom = useMemo(() => isInvoiceRoomUtil(report), [report]);
    const isTaskReport = useMemo(() => isTaskReportUtil(report), [report]);
    const isSelfDM = useMemo(() => isSelfDMUtil(report), [report]);
    const isTrackExpenseReport = useMemo(() => isTrackExpenseReportUtil(report, parentReport, parentReportAction), [report, parentReport, parentReportAction]);
    const isCanceledTaskReport = isCanceledTaskReportUtil(report, parentReportAction);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const isTaskModifiable = canModifyTask(report, currentUserPersonalDetails?.accountID, isParentReportArchived);
    const isTaskActionable = canActionTask(report, parentReportAction, currentUserPersonalDetails?.accountID, parentReport, isParentReportArchived);
    const canEditReportDescription = useMemo(() => canEditReportDescriptionUtil(report, policy), [report, policy]);
    const shouldShowReportDescription = isChatRoom && (canEditReportDescription || report.description !== '') && (isTaskReport ? isTaskModifiable : true);
    const isExpenseReport = isMoneyRequestReport || isInvoiceReport || isMoneyRequest;
    const isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    const isSelfDMTrackExpenseReport = isTrackExpenseReport && isSelfDMUtil(parentReport);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isArchivedRoom = useMemo(() => isArchivedNonExpenseReport(report, isReportArchived), [report, isReportArchived]);
    const shouldDisableRename = useMemo(() => shouldDisableRenameUtil(report, isReportArchived), [report, isReportArchived]);
    const parentNavigationSubtitleData = getParentNavigationSubtitle(report, policy, conciergeReportID, translate, derivedParentReportName, isParentReportArchived);
    const base62ReportID = getBase62ReportID(Number(report.reportID));
    const ancestors = useAncestors(report);

    const chatRoomSubtitle = useMemo(() => {
        const subtitle = getChatRoomSubtitle(report, policy, conciergeReportID, translate, false, isReportArchived);

        if (subtitle) {
            return subtitle;
        }

        return '';
    }, [isReportArchived, report, policy, conciergeReportID, translate]);

    const isSystemChat = useMemo(() => isSystemChatUtil(report), [report]);
    const isGroupChat = useMemo(() => isGroupChatUtil(report), [report]);
    const isRootGroupChat = useMemo(() => isRootGroupChatUtil(report, isReportArchived), [report, isReportArchived]);
    const isThread = useMemo(() => isThreadUtil(report), [report]);
    const shouldOpenRoomMembersPage = isUserCreatedPolicyRoom || isChatThread || (isPolicyExpenseChat && isPolicyAdmin);
    const participants = useMemo(() => {
        return getParticipantsList(report, personalDetails, shouldOpenRoomMembersPage);
    }, [report, personalDetails, shouldOpenRoomMembersPage]);

    let caseID: CaseID;
    if (isMoneyRequestReport || isInvoiceReport) {
        // 3. MoneyReportHeader
        caseID = CASES.MONEY_REPORT;
    } else if (isSingleTransactionView) {
        // 2. MoneyRequestHeader
        caseID = CASES.MONEY_REQUEST;
    } else {
        // 1. HeaderView
        caseID = CASES.DEFAULT;
    }

    const isPrivateNotesFetchTriggered = reportLoadingState?.isLoadingPrivateNotes !== undefined;
    const requestParentReportAction = useMemo(() => {
        // 2. MoneyReport case
        if (caseID === CASES.MONEY_REPORT) {
            if (!reportActions || !transactionThreadReport?.parentReportActionID) {
                return undefined;
            }
            return reportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID);
        }
        return parentReportAction;
    }, [caseID, parentReportAction, reportActions, transactionThreadReport?.parentReportActionID]);
    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(requestParentReportAction);
    const [iouPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const [requestParentReportActionChildReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(requestParentReportAction?.childReportID)}`);

    const isActionOwner =
        typeof requestParentReportAction?.actorAccountID === 'number' &&
        typeof currentUserPersonalDetails?.accountID === 'number' &&
        requestParentReportAction.actorAccountID === currentUserPersonalDetails?.accountID;
    const isDeletedParentAction = isDeletedAction(requestParentReportAction);

    const moneyRequestReport: OnyxEntry<OnyxTypes.Report> = useMemo(() => {
        if (caseID === CASES.MONEY_REQUEST) {
            return parentReport;
        }
        return report;
    }, [caseID, parentReport, report]);
    const isMoneyRequestReportArchived = useReportIsArchived(moneyRequestReport?.reportID);
    const [moneyRequestReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`);

    const shouldShowTaskDeleteButton =
        isTaskReport &&
        !isCanceledTaskReport &&
        canWriteInReport(report) &&
        report.stateNum !== CONST.REPORT.STATE_NUM.APPROVED &&
        !isClosedReport(report) &&
        isTaskModifiable &&
        isTaskActionable;
    const canDeleteRequest = isActionOwner && (canDeleteTransaction(moneyRequestReport, isMoneyRequestReportArchived) || isSelfDMTrackExpenseReport) && !isDeletedParentAction;
    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [iouTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);
    const [iouOriginalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransaction?.comment?.originalTransactionID)}`);
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(iouTransactionID ? [iouTransactionID] : []);
    const {deleteTransactions, shouldOpenSplitExpenseEditFlowOnDelete} = useDeleteTransactions({
        report: parentReport,
        reportActions: requestParentReportAction ? [requestParentReportAction] : [],
        policy,
    });
    const isCardTransactionCanBeDeleted = canDeleteCardTransactionByLiabilityType(iouTransaction);
    const shouldShowDeleteButton = shouldShowTaskDeleteButton || (canDeleteRequest && isCardTransactionCanBeDeleted) || isDemoTransaction(iouTransaction);
    const shouldShowEditSplitOnDeleteAction = iouTransactionID ? shouldOpenSplitExpenseEditFlowOnDelete([iouTransactionID]) : false;
    let deleteMenuItemTitle = translate('reportActionContextMenu.deleteAction', requestParentReportAction);
    if (shouldShowEditSplitOnDeleteAction) {
        deleteMenuItemTitle = translate('iou.editSplits');
    } else if (caseID === CASES.DEFAULT) {
        deleteMenuItemTitle = translate('common.delete');
    }
    const isWorkspaceChat = useMemo(() => isWorkspaceChatUtil(report?.chatType ?? ''), [report?.chatType]);

    useEffect(() => {
        // Do not fetch private notes if the feature is disabled, isLoadingPrivateNotes is already defined, the network is offline, or if the report is a self DM.
        if (!Permissions.canUsePrivateNotes() || isPrivateNotesFetchTriggered || isOffline || isSelfDM) {
            return;
        }

        getReportPrivateNote(report?.reportID);
    }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered, isSelfDM]);

    const shouldParseFullTitle = parentReportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && !isGroupChat;
    const rawReportName = getReportName(reportForHeader, derivedHeaderReportName);
    const reportName = shouldParseFullTitle ? Parser.htmlToText(rawReportName) : rawReportName;
    const additionalRoomDetails = isExpenseReportUtil(report) || isPolicyExpenseChat || isInvoiceRoom ? chatRoomSubtitle : `${translate('threads.in')} ${chatRoomSubtitle}`;

    let roomDescription: string | undefined;
    if (caseID === CASES.MONEY_REQUEST) {
        roomDescription = translate('common.name');
    } else if (isGroupChat) {
        roomDescription = translate('newRoomPage.groupName');
    } else {
        roomDescription = translate('newRoomPage.roomName');
    }

    const icons = useMemo(
        () => getIcons(report, formatPhoneNumber, translate, personalDetails, null, '', -1, policy, undefined, isReportArchived, pendingDeleteMemberAccountIDs),
        [report, formatPhoneNumber, translate, personalDetails, policy, isReportArchived, pendingDeleteMemberAccountIDs],
    );

    const renderedAvatar = useMemo(() => {
        if (isChatRoom && !isThread) {
            return (
                <View style={styles.mb3}>
                    <RoomHeaderAvatars
                        icons={icons}
                        report={report}
                        policy={policy}
                        participants={participants}
                        currentUserAccountID={currentUserPersonalDetails.accountID}
                    />
                </View>
            );
        }
        if (!isGroupChat || isThread) {
            return (
                <View style={styles.mb3}>
                    <ReportHeaderAvatars reportID={report?.reportID ?? moneyRequestReport?.reportID} />
                </View>
            );
        }

        const groupChatIcon = icons.at(0);
        const groupChatAvatarSource = groupChatIcon?.source;
        const groupChatAvatar = groupChatAvatarSource ? (
            <UserAvatar
                source={groupChatAvatarSource}
                size={CONST.AVATAR_SIZE.XXXX_LARGE}
                accountID={getAccountIDFromAvatarID(groupChatIcon?.id)}
                fallbackIcon={groupChatIcon?.fallbackIcon}
            />
        ) : null;

        return (
            <AvatarWithImagePicker
                source={groupChatAvatarSource}
                avatar={groupChatAvatar}
                isUsingDefaultAvatar={!report.avatarUrl}
                onViewPhotoPress={() => Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(report.reportID))}
                onImageRemoved={() => {
                    // Calling this without a file will remove the avatar
                    updateGroupChatAvatar(report.reportID, report.avatarUrl);
                }}
                onImageSelected={(file) => updateGroupChatAvatar(report.reportID, report.avatarUrl, file)}
                editIcon={expensifyIcons.Camera}
                editIconStyle={styles.smallEditIconAccount}
                pendingAction={report.pendingFields?.avatar ?? undefined}
                errors={report.errorFields?.avatar ?? null}
                errorRowStyles={styles.mt6}
                onErrorClose={() => clearAvatarErrors(report.reportID)}
                style={[styles.w100, styles.mb3]}
            />
        );
    }, [
        isChatRoom,
        isThread,
        isGroupChat,
        icons,
        report,
        styles.smallEditIconAccount,
        styles.mt6,
        styles.w100,
        styles.mb3,
        policy,
        participants,
        moneyRequestReport?.reportID,
        expensifyIcons.Camera,
        currentUserPersonalDetails?.accountID,
    ]);

    const canJoin = canJoinChat(report, parentReportAction, policy, parentReport, !!reportNameValuePairs?.private_isArchived);

    const promotedActions = useMemo(() => {
        const result: PromotedAction[] = [];

        if (canJoin) {
            result.push(PromotedActions.join(report, currentUserPersonalDetails.accountID));
        }

        if (report) {
            result.push(PromotedActions.pin(report));
        }

        result.push(PromotedActions.share());

        return result;
    }, [canJoin, report, currentUserPersonalDetails.accountID]);

    const shouldDisplayGroupWorkspaceAsPushRow = !isThread && (isGroupChat || isUserCreatedPolicyRoom || isDefaultRoom);
    const nameSectionGroupWorkspace = (
        <OfflineWithFeedback
            pendingAction={report?.pendingFields?.reportName}
            errors={report?.errorFields?.reportName ?? null}
            errorRowStyles={[styles.ph5]}
            onClose={() => clearPolicyRoomNameErrors(report?.reportID)}
        >
            <View style={[styles.flex1, !shouldDisableRename && styles.mt3]}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!shouldDisableRename}
                    interactive={!shouldDisableRename}
                    title={StringUtils.lineBreaksToSpaces(reportName)}
                    titleStyle={[styles.newKansasLarge, !shouldDisplayGroupWorkspaceAsPushRow && styles.textAlignCenter]}
                    titleContainerStyle={!shouldDisplayGroupWorkspaceAsPushRow && styles.alignItemsCenter}
                    shouldCheckActionAllowedOnPress={false}
                    description={shouldDisplayGroupWorkspaceAsPushRow ? roomDescription : ''}
                    furtherDetails={chatRoomSubtitle && !isGroupChat && !shouldDisplayGroupWorkspaceAsPushRow ? additionalRoomDetails : ''}
                    furtherDetailsNumberOfLines={isWorkspaceChat ? 0 : undefined}
                    furtherDetailsStyle={isWorkspaceChat ? [styles.textAlignCenter, styles.breakWord] : undefined}
                    onPress={() => {
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_SETTINGS_NAME.path));
                    }}
                    numberOfLinesTitle={isThread ? 2 : 0}
                    shouldBreakWord
                />
                {shouldDisplayGroupWorkspaceAsPushRow && !isGroupChat && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon={false}
                        interactive={false}
                        description={translate('workspace.common.workspace')}
                        title={getPolicyName({report, unavailableTranslation: translate('workspace.common.unavailable')})}
                        numberOfLinesTitle={2}
                        shouldBreakWord
                    />
                )}
            </View>
        </OfflineWithFeedback>
    );

    const titleField = useMemo<OnyxTypes.PolicyReportField | undefined>((): OnyxTypes.PolicyReportField | undefined => {
        const fields = getAvailableReportFields(report, Object.values(policy?.fieldList ?? {}));
        return fields.find((reportField) => isReportFieldOfTypeTitle(reportField));
    }, [report, policy?.fieldList]);
    const fieldKey = getReportFieldKey(titleField?.fieldID);
    const isFieldDisabled = isReportFieldDisabled(report, titleField, policy);

    const shouldShowEditableTitleField = caseID !== CASES.MONEY_REQUEST && canEditReportTitle(report, policy, currentUserPersonalDetails?.accountID);

    const nameSectionFurtherDetailsContent = (
        <MenuItemWithTopDescription
            shouldShowRightIcon={false}
            interactive={false}
            titleComponent={
                <ParentNavigationSubtitle
                    parentNavigationSubtitleData={parentNavigationSubtitleData}
                    reportID={report?.reportID}
                    parentReportID={report?.parentReportID}
                    parentReportActionID={report?.parentReportActionID}
                    pressableStyles={[styles.mt1, styles.mw100]}
                    textStyles={[styles.popoverMenuText, styles.flexShrink1, styles.preWrap, styles.mw100]}
                    subtitleNumberOfLines={2}
                    shouldShowFromPrefix={false}
                    openParentReportInCurrentTab
                />
            }
            description={translate('threads.from')}
            descriptionTextStyle={[styles.mutedNormalTextLabel, styles.mb1]}
            shouldCheckActionAllowedOnPress={false}
        />
    );

    const nameSectionTitleField = (
        <OfflineWithFeedback
            pendingAction={report.pendingFields?.reportName}
            errors={report.errorFields?.reportName ?? null}
            errorRowStyles={styles.ph5}
            key={`menuItem-${fieldKey}`}
            onClose={() => clearPolicyRoomNameErrors(report.reportID)}
        >
            <View style={[styles.flex1]}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon={shouldShowEditableTitleField && !isFieldDisabled}
                    interactive={shouldShowEditableTitleField && !isFieldDisabled}
                    title={reportName}
                    titleStyle={styles.newKansasLarge}
                    shouldCheckActionAllowedOnPress={false}
                    description={translate('task.title')}
                    onPress={
                        shouldShowEditableTitleField && report.policyID
                            ? () => {
                                  if (!report?.policyID) {
                                      return;
                                  }

                                  Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EDIT_REPORT_FIELD.getRoute(report.policyID, CONST.REPORT_FIELD_TITLE_FIELD_ID)));
                              }
                            : undefined
                    }
                />
            </View>
        </OfflineWithFeedback>
    );

    const deleteTransaction = useCallback(() => {
        if (caseID === CASES.DEFAULT) {
            deleteTask(
                report,
                parentReport,
                isReportArchived,
                currentUserPersonalDetails.accountID,
                hasOutstandingChildTask,
                parentReportAction,
                conciergeReportID,
                delegateEmail,
                reportActionsForOriginalReportID,
                {
                    ancestors,
                    shouldNavigateBack: !taskDeleteBackTo,
                },
            );
            return;
        }

        if (!requestParentReportAction) {
            return;
        }

        const isTrackExpense = isTrackExpenseAction(requestParentReportAction);
        const {isExpenseSplit: isSelfDMExpenseSplit} = getOriginalTransactionWithSplitInfo(iouTransaction, iouOriginalTransaction);

        if (isTrackExpense && !isSelfDMExpenseSplit) {
            deleteTrackExpense({
                chatReportID: moneyRequestReport?.reportID,
                chatReport: moneyRequestReport,
                chatReportActions: moneyRequestReportActions,
                transactionID: iouTransactionID,
                reportAction: requestParentReportAction,
                iouReport,
                chatIOUReport,
                transactions: duplicateTransactions,
                violations: duplicateTransactionViolations,
                isSingleTransactionView,
                isChatReportArchived: isMoneyRequestReportArchived,
                isChatIOUReportArchived,
                allTransactionViolationsParam: allTransactionViolations,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                currentUserEmail: currentUserPersonalDetails.email ?? '',
                policy: iouPolicy,
                getCurrencyDecimals,
            });
        } else if (iouTransactionID) {
            const deleteResult = deleteTransactions([iouTransactionID], duplicateTransactions, duplicateTransactionViolations, undefined, isSingleTransactionView);
            if (deleteResult.action === 'redirected') {
                return;
            }
            removeTransaction(iouTransactionID);
        }
    }, [
        caseID,
        taskDeleteBackTo,
        requestParentReportAction,
        iouTransaction,
        iouOriginalTransaction,
        iouTransactionID,
        report,
        parentReport,
        isReportArchived,
        currentUserPersonalDetails.accountID,
        currentUserPersonalDetails.email,
        hasOutstandingChildTask,
        parentReportAction,
        conciergeReportID,
        delegateEmail,
        ancestors,
        reportActionsForOriginalReportID,
        moneyRequestReport,
        moneyRequestReportActions,
        iouReport,
        chatIOUReport,
        duplicateTransactions,
        duplicateTransactionViolations,
        isSingleTransactionView,
        isMoneyRequestReportArchived,
        isChatIOUReportArchived,
        allTransactionViolations,
        deleteTransactions,
        removeTransaction,
        iouPolicy,
        getCurrencyDecimals,
    ]);

    // Where to navigate back to after deleting the transaction and its report.
    const navigateToTargetUrl = useCallback(() => {
        if (caseID === CASES.DEFAULT && taskDeleteBackTo) {
            Navigation.goBack(taskDeleteBackTo);
            return;
        }

        let urlToNavigateBack: string | undefined;
        // Only proceed with navigation logic if transaction was actually deleted
        if (!isEmptyObject(requestParentReportAction)) {
            const rootState = navigationRef.getRootState();
            const rhp = rootState.routes.at(-1);
            const rhpRoutes = rhp?.state?.routes ?? [];
            const previousRoute = rhpRoutes.at(-2);
            const superWideRHPIndex = rhpRoutes.findIndex((rhpRoute) => SUPER_WIDE_RIGHT_MODALS.has(rhpRoute.name));

            // If the deleted expense is displayed directly below, close the entire RHP
            const isSuperWideRHPDisplayed = superWideRHPIndex > -1;
            const isSuperWideRHPDisplayedDirectlyBelow = isSuperWideRHPDisplayed && superWideRHPIndex === rhpRoutes.length - 2;
            if (
                isSuperWideRHPDisplayedDirectlyBelow &&
                (previousRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT])?.reportID === route.params.reportID
            ) {
                Navigation.dismissModal();
                return;
            }

            // If the deleted expense is opened from the super wide rhp, go back there.
            if (
                previousRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT &&
                (previousRoute.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT])?.reportID === route.params.reportID
            ) {
                if (isSuperWideRHPDisplayed) {
                    const distanceToPop = rhpRoutes.length - 1 - superWideRHPIndex;
                    navigationRef.dispatch({...StackActions.pop(distanceToPop), target: rhp?.state?.key});
                    return;
                }
                Navigation.dismissModal();
                return;
            }

            const isTrackExpense = isTrackExpenseAction(requestParentReportAction);
            if (isTrackExpense) {
                urlToNavigateBack = getNavigationUrlAfterTrackExpenseDelete(
                    moneyRequestReport?.reportID,
                    moneyRequestReport,
                    iouTransactionID,
                    requestParentReportAction,
                    iouReport,
                    chatIOUReport,
                    isChatIOUReportArchived,
                    getCurrencyDecimals,
                    isSingleTransactionView,
                );
            } else {
                urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(
                    iouTransactionID,
                    requestParentReportAction,
                    requestParentReportActionChildReport,
                    iouReport,
                    chatIOUReport,
                    isChatIOUReportArchived,
                    getCurrencyDecimals,
                    isSingleTransactionView,
                );
            }
        }

        if (!urlToNavigateBack) {
            Navigation.dismissModal();
        } else {
            setDeleteTransactionNavigateBackUrl(urlToNavigateBack);
            navigateBackOnDeleteTransaction(urlToNavigateBack as Route);
        }
    }, [
        caseID,
        taskDeleteBackTo,
        requestParentReportAction,
        route.params.reportID,
        moneyRequestReport,
        iouTransactionID,
        iouReport,
        chatIOUReport,
        isChatIOUReportArchived,
        isSingleTransactionView,
        requestParentReportActionChildReport,
        getCurrencyDecimals,
    ]);

    const showDeleteModal = useCallback(async () => {
        const deletePrompt = caseID === CASES.DEFAULT ? translate('task.deleteConfirmation') : getDeleteConfirmationPrompt(translate, iouTransaction);
        const {action} = await showConfirmModal({
            title: caseID === CASES.DEFAULT ? translate('task.deleteTask') : getDeleteExpenseTitle(translate, iouTransaction),
            prompt: deletePrompt,
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            shouldEnableNewFocusManagement: true,
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        const shouldOpenSplitExpenseEditFlow = iouTransactionID ? shouldOpenSplitExpenseEditFlowOnDelete([iouTransactionID]) : false;
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            if (shouldOpenSplitExpenseEditFlow) {
                deleteTransaction();
                return;
            }

            navigateToTargetUrl();
            // Delay deletion until the RHP close animation finishes to prevent a brief
            // "Not Found" flash inside the animating-out panel on slower devices.
            TransitionTracker.runAfterTransitions({callback: deleteTransaction, waitForUpcomingTransition: true});
        });
    }, [showConfirmModal, translate, caseID, iouTransaction, iouTransactionID, shouldOpenSplitExpenseEditFlowOnDelete, navigateToTargetUrl, deleteTransaction]);

    const mentionReportContextValue = useMemo(() => ({currentReportID: report.reportID, exactlyMatch: true}), [report.reportID]);

    const shouldShowFurtherDetailsContent =
        !isEmptyObject(parentNavigationSubtitleData) && (shouldShowEditableTitleField || isMoneyRequestReport || isInvoiceReport || isMoneyRequest || isTaskReport);

    return (
        <ScreenWrapper testID="DynamicReportDetailsPage">
            <FullPageNotFoundView shouldShow={isEmptyObject(report)}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(navigateBackFromReportDetailsPath)}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.reportDetailsTitleContainer, styles.pb0]}>{renderedAvatar}</View>
                    {isExpenseReport && nameSectionTitleField}
                    {isExpenseReport && shouldShowFurtherDetailsContent && nameSectionFurtherDetailsContent}

                    {!isExpenseReport && nameSectionGroupWorkspace}

                    {shouldShowReportDescription && (
                        <OfflineWithFeedback pendingAction={report.pendingFields?.description}>
                            <MentionReportContext.Provider value={mentionReportContextValue}>
                                <MenuItemWithTopDescription
                                    shouldShowRightIcon
                                    interactive
                                    title={getReportDescription(report)}
                                    shouldRenderAsHTML
                                    shouldTruncateTitle
                                    characterLimit={100}
                                    shouldCheckActionAllowedOnPress={false}
                                    description={translate('reportDescriptionPage.roomDescription')}
                                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_DESCRIPTION.path))}
                                />
                            </MentionReportContext.Provider>
                        </OfflineWithFeedback>
                    )}

                    {isFinancialReportsForBusinesses && (
                        <>
                            <MenuItemWithTopDescription
                                title={base62ReportID}
                                description={translate('common.reportID')}
                                copyValue={base62ReportID}
                                interactive={false}
                                shouldBlockSelection
                                copyable
                            />
                            <MenuItemWithTopDescription
                                title={report.reportID}
                                description={translate('common.longReportID')}
                                copyValue={report.reportID}
                                interactive={false}
                                shouldBlockSelection
                                copyable
                            />
                        </>
                    )}

                    <PromotedActionsBar
                        containerStyle={styles.mt5}
                        promotedActions={promotedActions}
                    />

                    <ReportDetailsMenuItems
                        report={report}
                        policy={policy}
                        parentReport={parentReport}
                        participants={participants}
                        pendingChatMembers={reportMetadata?.pendingChatMembers}
                        personalDetails={personalDetails}
                        conciergeReportID={conciergeReportID}
                        delegateEmail={delegateEmail}
                        actionReportID={actionReportID}
                        iouTransactionID={iouTransactionID}
                        iouTransaction={iouTransaction}
                        iouOriginalTransaction={iouOriginalTransaction}
                        moneyRequestReportID={moneyRequestReport?.reportID}
                        moneyRequestReportActions={moneyRequestReportActions}
                        navigateBackFromReportDetailsPath={navigateBackFromReportDetailsPath}
                        isReportArchived={isReportArchived}
                        isArchivedRoom={isArchivedRoom}
                        isSelfDM={isSelfDM}
                        isChatRoom={isChatRoom}
                        isGroupChat={isGroupChat}
                        isRootGroupChat={isRootGroupChat}
                        isDefaultRoom={isDefaultRoom}
                        isChatThread={isChatThread}
                        isSystemChat={isSystemChat}
                        isPolicyAdmin={isPolicyAdmin}
                        isPolicyEmployee={isPolicyEmployee}
                        isPolicyExpenseChat={isPolicyExpenseChat}
                        isUserCreatedPolicyRoom={isUserCreatedPolicyRoom}
                        isTrackExpenseReport={isTrackExpenseReport}
                        isDeletedParentAction={isDeletedParentAction}
                        isMoneyRequestReport={isMoneyRequestReport}
                        isInvoiceReport={isInvoiceReport}
                        isTaskReport={isTaskReport}
                        isCanceledTaskReport={isCanceledTaskReport}
                        isTaskActionable={isTaskActionable}
                        shouldOpenRoomMembersPage={shouldOpenRoomMembersPage}
                    />

                    {shouldShowDeleteButton && (
                        <MenuItemAction
                            key={CONST.REPORT_DETAILS_MENU_ITEM.DELETE}
                            icon={shouldShowEditSplitOnDeleteAction ? expensifyIcons.ArrowSplit : expensifyIcons.Trashcan}
                            title={deleteMenuItemTitle}
                            onPress={shouldShowEditSplitOnDeleteAction ? deleteTransaction : showDeleteModal}
                        />
                    )}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicReportDetailsPage);
