import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyMembers, ReimbursementAccount, Report, ReportActions} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import * as CollectionUtils from './CollectionUtils';
import * as CurrencyUtils from './CurrencyUtils';
import type {Phrase, PhraseParameters} from './Localize';
import * as OptionsListUtils from './OptionsListUtils';
import {hasCustomUnitsError, hasPolicyError, hasPolicyMemberError, hasTaxRateError} from './PolicyUtils';
import * as ReportUtils from './ReportUtils';

type CheckingMethod = () => boolean;

let allReports: OnyxCollection<Report>;

type BrickRoad = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

let allPolicies: OnyxCollection<Policy>;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

let allPolicyMembers: OnyxCollection<PolicyMembers>;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
    waitForCollectionCallback: true,
    callback: (val) => {
        allPolicyMembers = val;
    },
});

let reimbursementAccount: OnyxEntry<ReimbursementAccount>;

Onyx.connect({
    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    callback: (val) => {
        reimbursementAccount = val;
    },
});

const reportActionsByReport: OnyxCollection<ReportActions> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }

        const reportID = CollectionUtils.extractCollectionItemID(key);
        reportActionsByReport[reportID] = actions;
    },
});

/**
 * @param report
 * @returns BrickRoad for the policy passed as a param
 */
const getBrickRoadForPolicy = (report: Report): BrickRoad => {
    const reportActions = reportActionsByReport?.[report.reportID] ?? {};
    const reportErrors = OptionsListUtils.getAllReportErrors(report, reportActions);
    const doesReportContainErrors = Object.keys(reportErrors ?? {}).length !== 0 ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
    if (doesReportContainErrors) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }

    // To determine if the report requires attention from the current user, we need to load the parent report action
    let itemParentReportAction = {};
    if (report.parentReportID) {
        const itemParentReportActions = reportActionsByReport[report.parentReportID] ?? {};
        itemParentReportAction = report.parentReportActionID ? itemParentReportActions[report.parentReportActionID] : {};
    }
    const reportOption = {...report, isUnread: ReportUtils.isUnread(report), isUnreadWithMention: ReportUtils.isUnreadWithMention(report)};
    const shouldShowGreenDotIndicator = ReportUtils.requiresAttentionFromCurrentUser(reportOption, itemParentReportAction);
    return shouldShowGreenDotIndicator ? CONST.BRICK_ROAD_INDICATOR_STATUS.INFO : undefined;
};

function hasGlobalWorkspaceSettingsRBR(policies: OnyxCollection<Policy>, policyMembers: OnyxCollection<PolicyMembers>) {
    // When attempting to open a policy with an invalid policyID, the policy collection is updated to include policy objects with error information.
    // Only policies displayed on the policy list page should be verified. Otherwise, the user will encounter an RBR unrelated to any policies on the list.
    const cleanPolicies = Object.fromEntries(Object.entries(policies ?? {}).filter(([, policy]) => policy?.id));

    const cleanAllPolicyMembers = Object.fromEntries(Object.entries(policyMembers ?? {}).filter(([, policyMemberValues]) => !!policyMemberValues));
    const errorCheckingMethods: CheckingMethod[] = [
        () => Object.values(cleanPolicies).some(hasPolicyError),
        () => Object.values(cleanPolicies).some(hasCustomUnitsError),
        () => Object.values(cleanPolicies).some(hasTaxRateError),
        () => Object.values(cleanAllPolicyMembers).some(hasPolicyMemberError),
        () => Object.keys(reimbursementAccount?.errors ?? {}).length > 0,
    ];

    return errorCheckingMethods.some((errorCheckingMethod) => errorCheckingMethod());
}

function hasWorkspaceSettingsRBR(policy: Policy) {
    const policyMemberError = allPolicyMembers ? hasPolicyMemberError(allPolicyMembers[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policy.id}`]) : false;
    const taxRateError = hasTaxRateError(policy);

    return Object.keys(reimbursementAccount?.errors ?? {}).length > 0 || hasPolicyError(policy) || hasCustomUnitsError(policy) || policyMemberError || taxRateError;
}

function getChatTabBrickRoad(policyID?: string): BrickRoad | undefined {
    if (!allReports) {
        return undefined;
    }

    // If policyID is undefined, then all reports are checked whether they contain any brick road
    const policyReports = policyID ? Object.values(allReports).filter((report) => report?.policyID === policyID) : Object.values(allReports);

    let hasChatTabGBR = false;

    const hasChatTabRBR = policyReports.some((report) => {
        const brickRoad = report ? getBrickRoadForPolicy(report) : undefined;
        if (!hasChatTabGBR && brickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
            hasChatTabGBR = true;
        }
        return brickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    });

    if (hasChatTabRBR) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }

    if (hasChatTabGBR) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    return undefined;
}

function checkIfWorkspaceSettingsTabHasRBR(policyID?: string) {
    if (!policyID) {
        return hasGlobalWorkspaceSettingsRBR(allPolicies, allPolicyMembers);
    }
    const policy = allPolicies ? allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : null;

    if (!policy) {
        return false;
    }

    return hasWorkspaceSettingsRBR(policy);
}

/**
 * @returns a map where the keys are policyIDs and the values are BrickRoads for each policy
 */
function getWorkspacesBrickRoads(): Record<string, BrickRoad> {
    if (!allReports) {
        return {};
    }

    // The key in this map is the workspace id
    const workspacesBrickRoadsMap: Record<string, BrickRoad> = {};
    Object.values(allPolicies ?? {}).forEach((policy) => {
        // Only policies which user has access to on the list should be checked. Policies that don't have an ID and contain only information about the errors aren't displayed anywhere.
        if (!policy?.id) {
            return;
        }

        if (hasWorkspaceSettingsRBR(policy)) {
            workspacesBrickRoadsMap[policy.id] = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        }
    });

    Object.values(allReports).forEach((report) => {
        const policyID = report?.policyID ?? CONST.POLICY.EMPTY;
        if (!report || workspacesBrickRoadsMap[policyID] === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
            return;
        }
        const workspaceBrickRoad = getBrickRoadForPolicy(report);

        if (!workspaceBrickRoad && !!workspacesBrickRoadsMap[policyID]) {
            return;
        }

        workspacesBrickRoadsMap[policyID] = workspaceBrickRoad;
    });

    return workspacesBrickRoadsMap;
}

/**
 * @returns a map where the keys are policyIDs and the values are truthy booleans if policy has unread content
 */
function getWorkspacesUnreadStatuses(): Record<string, boolean> {
    if (!allReports) {
        return {};
    }

    const workspacesUnreadStatuses: Record<string, boolean> = {};

    Object.values(allReports).forEach((report) => {
        const policyID = report?.policyID;
        if (!policyID || workspacesUnreadStatuses[policyID]) {
            return;
        }

        // When the only message of a report is deleted lastVisibileActionCreated is not reset leading to wrongly
        // setting it Unread so we add additional condition here to avoid read workspace indicator from being bold.
        workspacesUnreadStatuses[policyID] = ReportUtils.isUnread(report) && !!report.lastActorAccountID;
    });

    return workspacesUnreadStatuses;
}

/**
 * @param unit Unit
 * @returns translation key for the unit
 */
function getUnitTranslationKey(unit: Unit): TranslationPaths {
    const unitTranslationKeysStrategy: Record<Unit, TranslationPaths> = {
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]: 'common.kilometers',
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES]: 'common.miles',
    };

    return unitTranslationKeysStrategy[unit];
}

/**
 * @param error workspace change owner error
 * @param translate translation function
 * @param policy policy object
 * @param accountLogin account login/email
 * @returns ownership change checks page display text's
 */
function getOwnershipChecksDisplayText(
    error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>,
    translate: <TKey extends TranslationPaths>(phraseKey: TKey, ...phraseParameters: PhraseParameters<Phrase<TKey>>) => string,
    policy: OnyxEntry<Policy>,
    accountLogin: string | undefined,
) {
    let title;
    let text;
    let buttonText;

    const changeOwner = policy?.errorFields?.changeOwner;
    const subscription = changeOwner?.subscription as unknown as {ownerUserCount: number; totalUserCount: number};
    const ownerOwesAmount = changeOwner?.ownerOwesAmount as unknown as {ownerEmail: string; amount: number; currency: string};

    switch (error) {
        case CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
            title = translate('workspace.changeOwner.amountOwedTitle');
            text = translate('workspace.changeOwner.amountOwedText');
            buttonText = translate('workspace.changeOwner.amountOwedButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT:
            title = translate('workspace.changeOwner.ownerOwesAmountTitle');
            text = translate('workspace.changeOwner.ownerOwesAmountText', {
                email: ownerOwesAmount?.ownerEmail,
                amount: CurrencyUtils.convertToDisplayString(ownerOwesAmount?.amount, ownerOwesAmount?.currency),
            });
            buttonText = translate('workspace.changeOwner.ownerOwesAmountButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION:
            title = translate('workspace.changeOwner.subscriptionTitle');
            text = translate('workspace.changeOwner.subscriptionText', {
                usersCount: subscription?.ownerUserCount,
                finalCount: subscription?.totalUserCount,
            });
            buttonText = translate('workspace.changeOwner.subscriptionButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION:
            title = translate('workspace.changeOwner.duplicateSubscriptionTitle');
            text = translate('workspace.changeOwner.duplicateSubscriptionText', {
                email: changeOwner?.duplicateSubscription,
                workspaceName: policy?.name,
            });
            buttonText = translate('workspace.changeOwner.duplicateSubscriptionButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS:
            title = translate('workspace.changeOwner.hasFailedSettlementsTitle');
            text = translate('workspace.changeOwner.hasFailedSettlementsText', {email: accountLogin});
            buttonText = translate('workspace.changeOwner.hasFailedSettlementsButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.FAILED_TO_CLEAR_BALANCE:
            title = translate('workspace.changeOwner.failedToClearBalanceTitle');
            text = translate('workspace.changeOwner.failedToClearBalanceText');
            buttonText = translate('workspace.changeOwner.failedToClearBalanceButtonText');
            break;
        default:
            title = '';
            text = '';
            buttonText = '';
            break;
    }

    return {title, text, buttonText};
}

export {
    getBrickRoadForPolicy,
    getWorkspacesBrickRoads,
    getWorkspacesUnreadStatuses,
    hasGlobalWorkspaceSettingsRBR,
    checkIfWorkspaceSettingsTabHasRBR,
    hasWorkspaceSettingsRBR,
    getChatTabBrickRoad,
    getUnitTranslationKey,
    getOwnershipChecksDisplayText,
};
export type {BrickRoad};
