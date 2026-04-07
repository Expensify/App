import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID, getWorkspaceChats} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BillingGraceEndPeriod, Policy, Report, Session, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {startMoneyRequest} from './IOU';
import Tab from './Tab';

// Module-level subscriptions — always current, zero cost to read at press time.
// These are not connected to any UI, so `Onyx.connectWithoutView` is appropriate.

let session: OnyxEntry<Session>;
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        session = value;
    },
});

let activePolicyID: OnyxEntry<string>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    callback: (value) => {
        activePolicyID = value;
    },
});

let allPolicies: OnyxCollection<Policy>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicies = value;
    },
});

let allTransactionDrafts: OnyxCollection<Transaction>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allTransactionDrafts = value;
    },
});

let ownerBillingGracePeriodEnd: OnyxEntry<number>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
    callback: (value) => {
        ownerBillingGracePeriodEnd = value;
    },
});

let userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END,
    waitForCollectionCallback: true,
    callback: (value) => {
        userBillingGracePeriodEnds = value;
    },
});

function getDraftTransactionIDs(): string[] {
    return Object.values(allTransactionDrafts ?? {}).reduce<string[]>((acc, draft) => {
        if (draft) {
            acc.push(draft.transactionID);
        }
        return acc;
    }, []);
}

function getPolicyChatForActivePolicy(): OnyxEntry<Report> {
    if (!activePolicyID || !session?.accountID) {
        return undefined;
    }

    const activePolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`];
    if (isEmptyObject(activePolicy) || !activePolicy?.isPolicyExpenseChatEnabled) {
        return undefined;
    }

    const policyChats = getWorkspaceChats(activePolicyID, [session.accountID]);
    return policyChats.at(0) ?? undefined;
}

/**
 * Start a scan request (used by FAB long-press).
 * Reads all necessary data from module-level Onyx subscriptions — no hooks needed in the component.
 */
function startScan() {
    interceptAnonymousUser(() => {
        const reportID = generateReportID();
        startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, getDraftTransactionIDs(), CONST.IOU.REQUEST_TYPE.SCAN, false, undefined, true);
    });
}

/**
 * Start a quick scan request (used by FloatingReceiptButton press).
 * Reads all necessary data from module-level Onyx subscriptions — no hooks needed in the component.
 */
function startQuickScan() {
    interceptAnonymousUser(() => {
        const reportID = generateReportID();
        const policyChat = getPolicyChatForActivePolicy();
        const policyChatPolicyID = policyChat?.policyID;
        const policyChatReportID = policyChat?.reportID;

        if (policyChatPolicyID && shouldRestrictUserBillableActions(policyChatPolicyID, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatPolicyID));
            return;
        }

        const quickActionReportID = policyChatReportID ?? reportID;
        Tab.setSelectedTab(CONST.TAB.IOU_REQUEST_TYPE, CONST.IOU.REQUEST_TYPE.SCAN);
        startMoneyRequest(CONST.IOU.TYPE.CREATE, quickActionReportID, getDraftTransactionIDs(), CONST.IOU.REQUEST_TYPE.SCAN, !!policyChatReportID, undefined, true);
    });
}

export {startScan, startQuickScan};
