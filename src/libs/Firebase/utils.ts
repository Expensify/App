// We have opted for `Onyx.connectWithoutView` here as this logic is strictly non-UI in nature.
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import type {PerfAttributes} from './types';

let reportsCount = 0;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        reportsCount = Object.keys(value ?? {}).length;
    },
});

let reportActionsCount = 0;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        reportActionsCount = Object.keys(value ?? {}).length;
    },
});

let transactionViolationsCount = 0;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        transactionViolationsCount = Object.keys(value ?? {}).length;
    },
});

let transactionsCount = 0;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => {
        transactionsCount = Object.keys(value ?? {}).length;
    },
});

let policiesCount = 0;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        policiesCount = Object.keys(value ?? {}).length;
    },
});

let personalDetailsCount = 0;
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        personalDetailsCount = Object.keys(value ?? {}).length;
    },
});

let currentSession: OnyxEntry<Session>;
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        currentSession = session;
    },
});

function getAttributes<T extends keyof PerfAttributes>(attributes?: T[]): Pick<PerfAttributes, T> {
    const allAttributes: PerfAttributes = {
        accountId: currentSession?.accountID?.toString() ?? 'N/A',
        reportsLength: reportsCount.toString(),
        reportActionsLength: reportActionsCount.toString(),
        personalDetailsLength: personalDetailsCount.toString(),
        transactionViolationsLength: transactionViolationsCount.toString(),
        policiesLength: policiesCount.toString(),
        transactionsLength: transactionsCount.toString(),
    };

    if (attributes && attributes.length > 0) {
        const selectedAttributes = {} as Pick<PerfAttributes, T>;
        attributes.forEach((attribute) => {
            selectedAttributes[attribute] = allAttributes[attribute];
        });
        return selectedAttributes;
    }

    return allAttributes;
}

export default {
    getAttributes,
};
