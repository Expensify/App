// We have opted for `Onyx.connectWithoutView` here as this logic is strictly non-UI in nature.
import Onyx from 'react-native-onyx';
import * as SessionUtils from '@libs/SessionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
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

function getAttributes<T extends keyof PerfAttributes>(attributes?: T[]): Pick<PerfAttributes, T> {
    const session = SessionUtils.getSession();

    const allAttributes: PerfAttributes = {
        accountId: session?.accountID?.toString() ?? 'N/A',
        reportsLength: reportsCount.toString(),
        reportActionsLength: reportActionsCount.toString(),
        personalDetailsLength: personalDetailsCount.toString(),
        transactionViolationsLength: transactionViolationsCount.toString(),
        policiesLength: policiesCount.toString(),
        transactionsLength: transactionsCount.toString(),
    };

    if (attributes && attributes.length > 0) {
        const selectedAttributes = {} as Pick<PerfAttributes, T>;
        for (const attribute of attributes) {
            selectedAttributes[attribute] = allAttributes[attribute];
        }
        return selectedAttributes;
    }

    return allAttributes;
}

export default {
    getAttributes,
};
