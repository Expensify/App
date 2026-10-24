import type {LocaleContextProps} from '@components/LocaleContextProvider';

import getCollectionDelta from '@libs/getCollectionDelta';
import getReportAttributesUpdates from '@libs/getReportAttributesUpdates';
import SidebarUtils from '@libs/SidebarUtils';
import type {LHNOrderState} from '@libs/SidebarUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {GuideAccountIDsDerivedValue} from '@src/types/onyx/DerivedValues';
import type PriorityMode from '@src/types/onyx/PriorityMode';

import type {OnyxCollection, OnyxEntry, OnyxStateView} from 'react-native-onyx';

import {useRef} from 'react';
import {useOnyxState} from 'react-native-onyx';

import type {ReportsToDisplayInLHN} from './useSidebarOrderedReports';

const LHN_ORDERED_REPORTS_DEPENDENCIES = [
    ONYXKEYS.COLLECTION.REPORT,
    ONYXKEYS.COLLECTION.POLICY,
    ONYXKEYS.COLLECTION.TRANSACTION,
    ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS,
    ONYXKEYS.NVP_PRIORITY_MODE,
    ONYXKEYS.CONCIERGE_REPORT_ID,
];

type LHNOrderedReportsParams = {
    currentReportID: string | undefined;
    isDefaultRoomsBetaEnabled: boolean;
    isOffline: boolean;
    currentUserLogin: string;
    currentUserAccountID: number;
    localeCompare: LocaleContextProps['localeCompare'];
    cacheVersion: number;
};

type LHNOrderedReportsInputs = LHNOrderedReportsParams & {
    reports: OnyxCollection<OnyxTypes.Report>;
    policies: OnyxCollection<OnyxTypes.Policy>;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
    reportNameValuePairs: OnyxCollection<OnyxTypes.ReportNameValuePairs>;
    reportsDrafts: OnyxCollection<string>;
    reportAttributes: OnyxTypes.ReportAttributesDerivedValue['reports'] | undefined;
    guideAccountIDs: GuideAccountIDsDerivedValue | undefined;
    priorityMode: OnyxEntry<PriorityMode>;
    conciergeReportID: string | undefined;
};

type LHNOrderedReports = {
    reportsToDisplay: ReportsToDisplayInLHN;
    orderedReportIDs: string[];
    hasDraftByReportID: Record<string, boolean>;
    chatTabBrickRoad: BrickRoad;
};

type LHNOrderedReportsCache = {
    inputs: LHNOrderedReportsInputs;
    order: LHNOrderState;
    reportKeysByPolicyID: Map<string, Set<string>>;
    output: LHNOrderedReports;
};

const FULL_REBUILD_INPUTS = [
    'priorityMode',
    'isDefaultRoomsBetaEnabled',
    'isOffline',
    'conciergeReportID',
    'currentUserLogin',
    'currentUserAccountID',
    'localeCompare',
    'cacheVersion',
] as const satisfies ReadonlyArray<keyof LHNOrderedReportsInputs>;

const ALL_INPUTS = [
    ...FULL_REBUILD_INPUTS,
    'reports',
    'policies',
    'transactions',
    'transactionViolations',
    'reportNameValuePairs',
    'reportsDrafts',
    'reportAttributes',
    'currentReportID',
    'guideAccountIDs',
] as const satisfies ReadonlyArray<keyof LHNOrderedReportsInputs>;

function readInputs(state: OnyxStateView, params: LHNOrderedReportsParams): LHNOrderedReportsInputs {
    // useOnyxState's state view types a collection key as one member, but at runtime it returns the whole collection
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
    return {
        ...params,
        reports: state[ONYXKEYS.COLLECTION.REPORT] as OnyxCollection<OnyxTypes.Report>,
        policies: state[ONYXKEYS.COLLECTION.POLICY] as OnyxCollection<OnyxTypes.Policy>,
        transactions: state[ONYXKEYS.COLLECTION.TRANSACTION] as OnyxCollection<OnyxTypes.Transaction>,
        transactionViolations: state[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS] as OnyxCollection<OnyxTypes.TransactionViolations>,
        reportNameValuePairs: state[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS] as OnyxCollection<OnyxTypes.ReportNameValuePairs>,
        reportsDrafts: state[ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT] as OnyxCollection<string>,
        /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
        reportAttributes: state[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]?.reports,
        guideAccountIDs: state[ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS],
        priorityMode: state[ONYXKEYS.NVP_PRIORITY_MODE] ?? CONST.PRIORITY_MODE.DEFAULT,
        conciergeReportID: state[ONYXKEYS.CONCIERGE_REPORT_ID],
    };
}

function getHasDraftByReportID(reportsDrafts: OnyxCollection<string>): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(reportsDrafts ?? {})) {
        if (value) {
            result[key.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, '')] = true;
        }
    }
    return result;
}

function getReportKeysByPolicyID(reports: OnyxCollection<OnyxTypes.Report>): Map<string, Set<string>> {
    const result = new Map<string, Set<string>>();
    for (const [reportKey, report] of Object.entries(reports ?? {})) {
        const policyID = report?.policyID;
        if (!policyID) {
            continue;
        }
        const reportKeys = result.get(policyID) ?? new Set<string>();
        reportKeys.add(reportKey);
        result.set(policyID, reportKeys);
    }
    return result;
}

function toReportID(reportKey: string): string {
    return reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
}

function getDisplayParams(inputs: LHNOrderedReportsInputs) {
    return {
        currentReportId: inputs.currentReportID,
        reports: inputs.reports,
        isDefaultRoomsBetaEnabled: inputs.isDefaultRoomsBetaEnabled,
        draftComments: inputs.reportsDrafts,
        transactionViolations: inputs.transactionViolations,
        transactions: inputs.transactions,
        isOffline: inputs.isOffline,
        currentUserLogin: inputs.currentUserLogin,
        currentUserAccountID: inputs.currentUserAccountID,
        reportNameValuePairs: inputs.reportNameValuePairs,
        reportAttributes: inputs.reportAttributes,
        conciergeReportID: inputs.conciergeReportID,
        guideAccountIDs: inputs.guideAccountIDs,
    };
}

function buildFromScratch(inputs: LHNOrderedReportsInputs): LHNOrderedReportsCache {
    const reportsToDisplay = SidebarUtils.getReportsToDisplayInLHN({...getDisplayParams(inputs), priorityMode: inputs.priorityMode});
    const hasDraftByReportID = getHasDraftByReportID(inputs.reportsDrafts);
    const order = SidebarUtils.buildLHNOrder(reportsToDisplay, inputs.priorityMode, inputs.localeCompare, hasDraftByReportID, inputs.reportNameValuePairs, inputs.reportAttributes);
    return {
        inputs,
        order,
        reportKeysByPolicyID: getReportKeysByPolicyID(inputs.reports),
        output: {
            reportsToDisplay,
            orderedReportIDs: order.orderedReportIDs,
            hasDraftByReportID,
            chatTabBrickRoad: getChatTabBrickRoad(order.orderedReportIDs, inputs.reportAttributes),
        },
    };
}

function getUpdatedReportKeys(previous: LHNOrderedReportsInputs, inputs: LHNOrderedReportsInputs, reportKeysByPolicyID: Map<string, Set<string>>): Set<string> {
    const reportKeys = new Set<string>();

    for (const reportKey of Object.keys(getCollectionDelta(inputs.reports, previous.reports) ?? {})) {
        reportKeys.add(reportKey);
    }
    for (const key of Object.keys(getCollectionDelta(inputs.reportNameValuePairs, previous.reportNameValuePairs) ?? {})) {
        reportKeys.add(key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ONYXKEYS.COLLECTION.REPORT));
    }
    for (const key of Object.keys(getCollectionDelta(inputs.reportsDrafts, previous.reportsDrafts) ?? {})) {
        reportKeys.add(key.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, ONYXKEYS.COLLECTION.REPORT));
    }
    for (const reportID of getReportAttributesUpdates(inputs.reportAttributes, previous.reportAttributes) ?? []) {
        reportKeys.add(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    }
    for (const transactionKey of Object.keys(getCollectionDelta(inputs.transactions, previous.transactions) ?? {})) {
        reportKeys.add(`${ONYXKEYS.COLLECTION.REPORT}${inputs.transactions?.[transactionKey]?.reportID}`);
        const previousReportID = previous.transactions?.[transactionKey]?.reportID;
        if (previousReportID) {
            reportKeys.add(`${ONYXKEYS.COLLECTION.REPORT}${previousReportID}`);
        }
    }
    for (const violationKey of Object.keys(getCollectionDelta(inputs.transactionViolations, previous.transactionViolations) ?? {})) {
        const transactionKey = violationKey.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS.COLLECTION.TRANSACTION);
        reportKeys.add(`${ONYXKEYS.COLLECTION.REPORT}${inputs.transactions?.[transactionKey]?.reportID}`);
    }
    for (const policyKey of Object.keys(getCollectionDelta(inputs.policies, previous.policies) ?? {})) {
        for (const reportKey of reportKeysByPolicyID.get(policyKey.replace(ONYXKEYS.COLLECTION.POLICY, '')) ?? []) {
            reportKeys.add(reportKey);
        }
    }
    // Late guide hydration can make domain rooms that were filtered out displayable, so every report is rechecked.
    if (previous.guideAccountIDs !== undefined && previous.guideAccountIDs !== inputs.guideAccountIDs) {
        for (const reportKey of Object.keys(inputs.reports ?? {})) {
            reportKeys.add(reportKey);
        }
    }
    if (previous.currentReportID !== inputs.currentReportID) {
        reportKeys.add(`${ONYXKEYS.COLLECTION.REPORT}${previous.currentReportID}`);
        reportKeys.add(`${ONYXKEYS.COLLECTION.REPORT}${inputs.currentReportID}`);
    }

    return reportKeys;
}

function updateReportKeysByPolicyID(
    reportKeysByPolicyID: Map<string, Set<string>>,
    previousReports: OnyxCollection<OnyxTypes.Report>,
    reports: OnyxCollection<OnyxTypes.Report>,
): Map<string, Set<string>> {
    const delta = getCollectionDelta(reports, previousReports);
    if (!delta) {
        return reportKeysByPolicyID;
    }
    let result: Map<string, Set<string>> | undefined;
    for (const reportKey of Object.keys(delta)) {
        const previousPolicyID = previousReports?.[reportKey]?.policyID;
        const policyID = reports?.[reportKey]?.policyID;
        if (previousPolicyID === policyID) {
            continue;
        }
        result ??= new Map(reportKeysByPolicyID);
        if (previousPolicyID) {
            const reportKeys = new Set(result.get(previousPolicyID));
            reportKeys.delete(reportKey);
            result.set(previousPolicyID, reportKeys);
        }
        if (policyID) {
            const reportKeys = new Set(result.get(policyID));
            reportKeys.add(reportKey);
            result.set(policyID, reportKeys);
        }
    }
    return result ?? reportKeysByPolicyID;
}

function updateIncrementally(cache: LHNOrderedReportsCache, inputs: LHNOrderedReportsInputs): LHNOrderedReportsCache {
    const previous = cache.inputs;
    const updatedReportKeys = getUpdatedReportKeys(previous, inputs, cache.reportKeysByPolicyID);
    const reportKeysByPolicyID = updateReportKeysByPolicyID(cache.reportKeysByPolicyID, previous.reports, inputs.reports);

    if (updatedReportKeys.size === 0) {
        return {...cache, inputs, reportKeysByPolicyID};
    }

    const previousOutput = cache.output;
    const reportsToDisplay = SidebarUtils.updateReportsToDisplayInLHN({
        ...getDisplayParams(inputs),
        displayedReports: previousOutput.reportsToDisplay,
        updatedReportsKeys: [...updatedReportKeys],
        isInFocusMode: inputs.priorityMode === CONST.PRIORITY_MODE.GSD,
    });

    let hasDraftByReportID = previousOutput.hasDraftByReportID;
    const draftsDelta = getCollectionDelta(inputs.reportsDrafts, previous.reportsDrafts);
    if (draftsDelta) {
        const next = {...hasDraftByReportID};
        let hasChanged = false;
        for (const [draftKey, draft] of Object.entries(draftsDelta)) {
            const reportID = draftKey.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, '');
            if (!!draft === !!next[reportID]) {
                continue;
            }
            hasChanged = true;
            if (draft) {
                next[reportID] = true;
            } else {
                delete next[reportID];
            }
        }
        hasDraftByReportID = hasChanged ? next : hasDraftByReportID;
    }

    const order = SidebarUtils.updateLHNOrder(
        cache.order,
        [...updatedReportKeys].map(toReportID),
        reportsToDisplay,
        inputs.priorityMode,
        inputs.localeCompare,
        hasDraftByReportID,
        inputs.reportNameValuePairs,
        inputs.reportAttributes,
    );

    const orderedReportIDs = order.orderedReportIDs;
    const chatTabBrickRoad =
        orderedReportIDs === previousOutput.orderedReportIDs && inputs.reportAttributes === previous.reportAttributes
            ? previousOutput.chatTabBrickRoad
            : getChatTabBrickRoad(orderedReportIDs, inputs.reportAttributes);

    const hasOutputChanged =
        reportsToDisplay !== previousOutput.reportsToDisplay ||
        orderedReportIDs !== previousOutput.orderedReportIDs ||
        hasDraftByReportID !== previousOutput.hasDraftByReportID ||
        chatTabBrickRoad !== previousOutput.chatTabBrickRoad;

    return {
        inputs,
        order,
        reportKeysByPolicyID,
        output: hasOutputChanged ? {reportsToDisplay, orderedReportIDs, hasDraftByReportID, chatTabBrickRoad} : previousOutput,
    };
}

/**
 * Keeps the LHN display set and order up to date by re-evaluating only the reports touched since the last computation,
 * and returns the same object when nothing visible changed so the provider and its consumers skip re-rendering.
 */
function useLHNOrderedReports(params: LHNOrderedReportsParams): LHNOrderedReports {
    const cacheRef = useRef<LHNOrderedReportsCache | undefined>(undefined);

    return useOnyxState(
        (state) => {
            const inputs = readInputs(state, params);
            const cache = cacheRef.current;
            if (cache && ALL_INPUTS.every((input) => cache.inputs[input] === inputs[input])) {
                return cache.output;
            }
            const isFullRebuild = !cache || Object.keys(cache.output.reportsToDisplay).length === 0 || FULL_REBUILD_INPUTS.some((input) => cache.inputs[input] !== inputs[input]);
            const nextCache = isFullRebuild ? buildFromScratch(inputs) : updateIncrementally(cache, inputs);
            cacheRef.current = nextCache;
            return nextCache.output;
        },
        {dependencies: LHN_ORDERED_REPORTS_DEPENDENCIES, selectorEquality: Object.is},
    );
}

export default useLHNOrderedReports;
export type {LHNOrderedReports};
