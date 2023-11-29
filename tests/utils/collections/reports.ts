import {rand, randBoolean, randCurrencyCode, randWord} from '@ngneat/falso';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

export default function createRandomReport(index: number): Report {
    return {
        reportID: index.toString(),
        chatType: rand(Object.values(CONST.REPORT.CHAT_TYPE)),
        currency: randCurrencyCode(),
        displayName: randWord(),
        hasDraft: randBoolean(),
        ownerAccountID: index,
        isPinned: randBoolean(),
        isOptimisticReport: randBoolean(),
        isOwnPolicyExpenseChat: randBoolean(),
        isWaitingOnBankAccount: randBoolean(),
        isLastMessageDeletedParentAction: randBoolean(),
        policyID: index.toString(),
        reportName: randWord(),
    };
}
