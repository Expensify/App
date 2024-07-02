import {useCallback, useSyncExternalStore} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportMetadata} from '@src/types/onyx';
import useActiveWorkspace from './useActiveWorkspace';
import usePermissions from './usePermissions';

/*
 * This hook is used to get the lastAccessedReportID.
 * This is a piece of data that's derived from a lot of frequently-changing Onyx values: (reports, reportMetadata, policies, etc...)
 * We don't want any component that needs access to the lastAccessedReportID to have to re-render any time any of those values change, just when the lastAccessedReportID changes.
 * So we have a custom implementation in this file that leverages useSyncExternalStore to connect to a "store" of multiple Onyx values, and re-render only when the one derived value changes.
 */

const subscribers: Array<() => void> = [];

let reports: OnyxCollection<Report> = {};
let reportMetadata: OnyxCollection<ReportMetadata> = {};
let policies: OnyxCollection<Policy> = {};
let accountID: number | undefined;
let isFirstTimeNewExpensifyUser = false;

let reportsConnection: number;
let reportMetadataConnection: number;
let policiesConnection: number;
let accountIDConnection: number;
let isFirstTimeNewExpensifyUserConnection: number;

function notifySubscribers() {
    subscribers.forEach((subscriber) => subscriber());
}

function subscribeToOnyxData() {
    // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
    reportsConnection = Onyx.connect({
        key: ONYXKEYS.COLLECTION.REPORT,
        waitForCollectionCallback: true,
        callback: (value) => {
            reports = value;
            notifySubscribers();
        },
    });
    // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
    reportMetadataConnection = Onyx.connect({
        key: ONYXKEYS.COLLECTION.REPORT_METADATA,
        waitForCollectionCallback: true,
        callback: (value) => {
            reportMetadata = value;
            notifySubscribers();
        },
    });
    // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
    policiesConnection = Onyx.connect({
        key: ONYXKEYS.COLLECTION.POLICY,
        waitForCollectionCallback: true,
        callback: (value) => {
            policies = value;
            notifySubscribers();
        },
    });
    // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
    accountIDConnection = Onyx.connect({
        key: ONYXKEYS.SESSION,
        callback: (value) => {
            accountID = value?.accountID;
            notifySubscribers();
        },
    });
    // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
    isFirstTimeNewExpensifyUserConnection = Onyx.connect({
        key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
        callback: (value) => {
            isFirstTimeNewExpensifyUser = !!value;
            notifySubscribers();
        },
    });
}

function unsubscribeFromOnyxData() {
    if (reportsConnection) {
        Onyx.disconnect(reportsConnection);
        reportsConnection = 0;
    }
    if (reportMetadataConnection) {
        Onyx.disconnect(reportMetadataConnection);
        reportMetadataConnection = 0;
    }
    if (policiesConnection) {
        Onyx.disconnect(policiesConnection);
        policiesConnection = 0;
    }
    if (accountIDConnection) {
        Onyx.disconnect(accountIDConnection);
        accountIDConnection = 0;
    }
    if (isFirstTimeNewExpensifyUserConnection) {
        Onyx.disconnect(isFirstTimeNewExpensifyUserConnection);
        isFirstTimeNewExpensifyUserConnection = 0;
    }
}

function removeSubscriber(subscriber: () => void) {
    const subscriberIndex = subscribers.indexOf(subscriber);
    if (subscriberIndex < 0) {
        return;
    }
    subscribers.splice(subscriberIndex, 1);
    if (subscribers.length === 0) {
        unsubscribeFromOnyxData();
    }
}

function addSubscriber(subscriber: () => void) {
    subscribers.push(subscriber);
    if (!reportsConnection) {
        subscribeToOnyxData();
    }
    return () => removeSubscriber(subscriber);
}

/**
 * Get the last accessed reportID.
 */
export default function useLastAccessedReportID(shouldOpenOnAdminRoom: boolean) {
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    const getSnapshot = useCallback(() => {
        const policyMemberAccountIDs = getPolicyEmployeeListByIdWithoutCurrentUser(policies, activeWorkspaceID, accountID);
        return ReportUtils.findLastAccessedReport(
            reports,
            !canUseDefaultRooms,
            policies,
            isFirstTimeNewExpensifyUser,
            shouldOpenOnAdminRoom,
            reportMetadata,
            activeWorkspaceID,
            policyMemberAccountIDs,
        )?.reportID;
    }, [activeWorkspaceID, canUseDefaultRooms, shouldOpenOnAdminRoom]);

    // We need access to all the data from these Onyx.connect calls, but we don't want to re-render the consuming component
    // unless the derived value (lastAccessedReportID) changes. To address these, we'll wrap everything with useSyncExternalStore
    return useSyncExternalStore(addSubscriber, getSnapshot);
}
