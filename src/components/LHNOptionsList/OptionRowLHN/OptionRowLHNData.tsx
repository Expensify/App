import type {OptionRowLHNDataProps} from '@components/LHNOptionsList/types';
import {useCardList, usePersonalDetails, useWorkspaceCardList} from '@components/OnyxListItemProvider';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getLastVisibleActionIncludingTransactionThread, getOriginalMessage, isActionableTrackExpense, isInviteOrRemovedAction} from '@libs/ReportActionsUtils';
import {getExpensifyCardFromReportAction} from '@libs/ReportAlternateTextUtils';
import {canUserPerformWriteAction as canUserPerformWriteActionUtil, shouldShowMarkAsDone} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';

import CONST from '@src/CONST';
import {getMovedReportID} from '@src/libs/ModifiedExpenseMessage';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions as ReportActionsType, Rule} from '@src/types/onyx';
import type {ReportNamesDerivedValue, VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry, OnyxKey, OnyxStateView} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {deepEqual} from 'fast-equals';
import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useOnyxState} from 'react-native-onyx';

import OptionRowLHN from './OptionRowLHN';

type RecordedRead = {key: OnyxKey; path: string[]; value: unknown; isDeep: boolean};

type RowData = {
    optionItem: ReturnType<typeof SidebarUtils.getOptionData>;
    hasDraftComment: boolean;
    shouldShowMarkAsDoneCopy: boolean;
    iouReport: OnyxEntry<Report>;
    iouParentReportAction: OnyxEntry<ReportAction>;
    iouChatReport: OnyxEntry<Report>;
    deps: OnyxKey[];
    depsKey: string;
};

type RowCache = {reads: RecordedRead[]; closure: unknown[]; output: RowData};

function readPath(state: OnyxStateView, key: OnyxKey, path: string[]): unknown {
    let value: unknown = state[key];
    for (const segment of path) {
        if (!value || typeof value !== 'object') {
            return undefined;
        }
        value = Reflect.get(value, segment);
    }
    return value;
}

function isCacheValid(state: OnyxStateView, cache: RowCache | undefined, closure: unknown[]): cache is RowCache {
    if (!cache || cache.closure.length !== closure.length || cache.closure.some((value, index) => !Object.is(value, closure.at(index)))) {
        return false;
    }
    return cache.reads.every((read) => {
        const value = readPath(state, read.key, read.path);
        return read.isDeep ? deepEqual(value, read.value) : Object.is(value, read.value);
    });
}

function invoiceReceiverPolicyIDFromReport(report: OnyxEntry<Report>): string | undefined {
    return report?.invoiceReceiver && 'policyID' in report.invoiceReceiver ? report.invoiceReceiver.policyID : undefined;
}

function getInitialDependencies(reportID: string): OnyxKey[] {
    return [
        `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
        `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS,
        ONYXKEYS.CONCIERGE_REPORT_ID,
        `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
        ONYXKEYS.NVP_INTRO_SELECTED,
        ONYXKEYS.COLLECTION.RULE,
        ONYXKEYS.BANK_ACCOUNT_LIST,
    ];
}

function toSortedDeps(keys: readonly OnyxKey[]): OnyxKey[] {
    return [...new Set(keys)].sort();
}

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * OptionRowLHN is auto-memoized by React Compiler, so it will
 * only re-render when the inputs derived from this wrapper change.
 */
function OptionRowLHNData({isOptionFocused = false, viewMode = 'default', reportID, ...propsToForward}: OptionRowLHNDataProps) {
    const styles = useThemeStyles();
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isReportFocused = isOptionFocused && currentReportIDValue === reportID;
    const {translate, localeCompare, dateFnsLocale, formatPhoneNumber} = useLocalize();
    const {convertToDisplayString, convertToDisplayStringWithoutCurrency} = useCurrencyListActions();
    const {login, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const cardList = useCardList();
    const workspaceCardList = useWorkspaceCardList();

    const [dependencies, setDependencies] = useState<OnyxKey[]>(() => toSortedDeps(getInitialDependencies(reportID)));
    const cacheRef = useRef<RowCache | undefined>(undefined);

    const closure: unknown[] = [
        reportID,
        personalDetails,
        cardList,
        workspaceCardList,
        translate,
        dateFnsLocale,
        localeCompare,
        formatPhoneNumber,
        convertToDisplayString,
        convertToDisplayStringWithoutCurrency,
        currentUserAccountID,
        login,
    ];

    const rowData = useOnyxState(
        (state): RowData => {
            const cached = cacheRef.current;
            if (isCacheValid(state, cached, closure)) {
                return cached.output;
            }

            const reads: RecordedRead[] = [];
            const read = <TValue,>(key: OnyxKey, path: string[] = [], isDeep = false): TValue => {
                const value = readPath(state, key, path);
                reads.push({key, path, value, isDeep});
                // The state view is typed per key, the recorded read is the same value at runtime
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                return value as TValue;
            };

            const report = read<OnyxEntry<Report>>(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
            const reportAttributes = read<NonNullable<Parameters<typeof SidebarUtils.getOptionData>[0]['reportAttributes']>>(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, ['reports', reportID], true);
            const reportNameValuePairs = read<Parameters<typeof SidebarUtils.getOptionData>[0]['reportNameValuePairs']>(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
            const oneTransactionThreadReportID = reportAttributes?.oneTransactionThreadReportID;
            const oneTransactionThreadReport = read<OnyxEntry<Report>>(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(oneTransactionThreadReportID)}`);
            const transactionThreadReportID = oneTransactionThreadReport?.reportID;
            const policy = read<Parameters<typeof SidebarUtils.getOptionData>[0]['policy']>(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
            const parentReportInvoiceReceiverPolicyID = invoiceReceiverPolicyIDFromReport(
                read<OnyxEntry<Report>>(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`),
            );
            const invoiceReceiverPolicyID = parentReportInvoiceReceiverPolicyID ?? invoiceReceiverPolicyIDFromReport(report);
            const invoiceReceiverPolicy = read<Parameters<typeof SidebarUtils.getOptionData>[0]['policy']>(
                `${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(invoiceReceiverPolicyID)}`,
            );

            const reportActions = read<OnyxEntry<ReportActionsType>>(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
            const parentReportAction = report?.parentReportActionID
                ? read<OnyxEntry<ReportAction>>(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}`, [report.parentReportActionID])
                : undefined;
            const transactionThreadReportActions = transactionThreadReportID
                ? read<OnyxEntry<ReportActionsType>>(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`)
                : undefined;

            const visibleReportActionsData: VisibleReportActionsDerivedValue = {};
            const visibleReportEntry = read<VisibleReportActionsDerivedValue[string] | undefined>(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, [reportID], true);
            if (visibleReportEntry) {
                visibleReportActionsData[reportID] = visibleReportEntry;
            }
            if (transactionThreadReportID) {
                const visibleThreadEntry = read<VisibleReportActionsDerivedValue[string] | undefined>(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, [transactionThreadReportID], true);
                if (visibleThreadEntry) {
                    visibleReportActionsData[transactionThreadReportID] = visibleThreadEntry;
                }
            }

            const reportNamesView = new Proxy<ReportNamesDerivedValue>(
                {},
                {
                    get: (_target, id) => {
                        if (typeof id !== 'string') {
                            return undefined;
                        }
                        const reportName = read<string | undefined>(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, ['reports', id, 'reportName']);
                        return reportName === undefined ? undefined : {reportName};
                    },
                    ownKeys: () => Object.keys(readPath(state, ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, ['reports']) ?? {}),
                    getOwnPropertyDescriptor: () => ({enumerable: true, configurable: true}),
                },
            );

            const isReportArchived = !!reportNameValuePairs?.private_isArchived;
            const canUserPerformWrite = canUserPerformWriteActionUtil(report, isReportArchived);
            const actionsCollection: OnyxCollection<ReportActionsType> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: reportActions ?? undefined,
            };
            if (transactionThreadReportID) {
                actionsCollection[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] = transactionThreadReportActions ?? undefined;
            }
            const lastAction = getLastVisibleActionIncludingTransactionThread(reportID, canUserPerformWrite, actionsCollection, visibleReportActionsData, transactionThreadReportID);

            const whisperTransactionID = isActionableTrackExpense(lastAction) ? getOriginalMessage(lastAction)?.transactionID : undefined;
            const whisperTransaction = whisperTransactionID ? read<unknown>(`${ONYXKEYS.COLLECTION.TRANSACTION}${whisperTransactionID}`) : undefined;
            const lastMessageTextFromReport = whisperTransactionID && !whisperTransaction ? '' : undefined;

            const lastActionReportID = isInviteOrRemovedAction(lastAction) && lastAction?.actionName ? getOriginalMessage(lastAction)?.reportID : undefined;
            const lastActionReport = lastActionReportID ? read<OnyxEntry<Report>>(`${ONYXKEYS.COLLECTION.REPORT}${String(lastActionReportID)}`) : undefined;
            const movedFromReportID = getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.FROM);
            const movedFromReport = movedFromReportID ? read<OnyxEntry<Report>>(`${ONYXKEYS.COLLECTION.REPORT}${movedFromReportID}`) : undefined;
            const movedToReportID = getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.TO);
            const movedToReport = movedToReportID ? read<OnyxEntry<Report>>(`${ONYXKEYS.COLLECTION.REPORT}${movedToReportID}`) : undefined;

            const draftComment = read<string | undefined>(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
            const policyTags = read<Parameters<typeof SidebarUtils.getOptionData>[0]['policyTags']>(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`);
            const isTrackIntentUser = isTrackIntentUserSelector(read(ONYXKEYS.NVP_INTRO_SELECTED));
            const rules = read<OnyxCollection<Rule>>(ONYXKEYS.COLLECTION.RULE);
            const conciergeReportID = read<string | undefined>(ONYXKEYS.CONCIERGE_REPORT_ID);

            const isIOUReport = report?.type === CONST.REPORT.TYPE.IOU;
            const iouChatReport = isIOUReport ? read<OnyxEntry<Report>>(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`) : undefined;

            const card = getExpensifyCardFromReportAction({reportAction: lastAction, policy, cardList, workspaceCardList});

            const optionItem = SidebarUtils.getOptionData({
                dateFnsLocale,
                report,
                reportAttributes,
                oneTransactionThreadReport,
                reportNameValuePairs,
                personalDetails: personalDetails ?? {},
                policy,
                parentReportAction,
                conciergeReportID,
                lastMessageTextFromReport,
                invoiceReceiverPolicy,
                card,
                lastAction,
                translate,
                convertToDisplayString,
                convertToDisplayStringWithoutCurrency,
                localeCompare,
                isReportArchived,
                lastActionReport,
                movedFromReport,
                movedToReport,
                currentUserAccountID,
                reportAttributesDerived: reportNamesView,
                visibleReportActionsData,
                policyTags,
                currentUserLogin: login ?? '',
                isTrackIntentUser,
                formatPhoneNumber,
                rules,
                bankAccountList: read<Parameters<typeof SidebarUtils.getOptionData>[0]['bankAccountList']>(ONYXKEYS.BANK_ACCOUNT_LIST),
            });

            const deps = toSortedDeps(reads.map((recordedRead) => recordedRead.key));
            const output: RowData = {
                optionItem,
                hasDraftComment: !!draftComment && !draftComment.match(CONST.REGEX.EMPTY_COMMENT),
                shouldShowMarkAsDoneCopy: shouldShowMarkAsDone({report, isTrackIntentUser, policy, rules}) && optionItem?.actionBadge === CONST.REPORT.ACTION_BADGE.SUBMIT,
                iouReport: isIOUReport ? report : undefined,
                iouParentReportAction: isIOUReport ? parentReportAction : undefined,
                iouChatReport,
                deps,
                depsKey: deps.join(' '),
            };
            cacheRef.current = {reads, closure, output};
            return output;
        },
        {dependencies},
    );

    if (rowData.depsKey !== dependencies.join(' ')) {
        setDependencies(rowData.deps);
    }

    const {optionItem, hasDraftComment, shouldShowMarkAsDoneCopy, iouReport} = rowData;
    const reportPreviewSenderID = useReportPreviewSenderID({
        iouReport,
        action: rowData.iouParentReportAction,
        chatReport: rowData.iouChatReport,
    });

    // For single-sender IOUs, trim to the sender's avatar to match the header.
    // The header uses reportPreviewSenderID as accountID for its primary avatar,
    // so we pick the matching icon from getIconsForIOUReport to stay consistent.
    let finalOptionItem = optionItem;
    if (optionItem && iouReport && reportPreviewSenderID !== undefined && optionItem.icons && optionItem.icons.length > 1) {
        const senderIcon = optionItem.icons.find((icon) => Number(icon.id) === reportPreviewSenderID);
        finalOptionItem = {...optionItem, icons: [senderIcon ?? optionItem.icons.at(0)].filter((icon): icon is Icon => !!icon)};
    }

    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const placeholderRowStyle = StyleSheet.flatten<ViewStyle>(
        isInFocusMode
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );

    // rendering null as a render item causes the FlashList to render all
    // its children and consume significant memory on the first render. We can avoid this by
    // rendering a placeholder view instead. This behaviour is only observed when we
    // first sign in to the App.
    // For the focused-but-null case (e.g. submit an expense in offline mode and click on the
    // generated expense report), we render null so we only see the Report Details but no item in LHN.
    if (!finalOptionItem) {
        return isReportFocused ? null : <View style={placeholderRowStyle} />;
    }

    return (
        <OptionRowLHN
            {...propsToForward}
            viewMode={viewMode}
            isOptionFocused={isReportFocused}
            optionItem={finalOptionItem}
            hasDraftComment={hasDraftComment}
            shouldShowMarkAsDoneCopy={shouldShowMarkAsDoneCopy}
        />
    );
}

OptionRowLHNData.displayName = 'OptionRowLHNData';

export default OptionRowLHNData;
