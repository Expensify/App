import {rand, randBoolean, randWord} from '@ngneat/falso';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

export default function createRandomReport(index: number): Report {
    return {
        reportID: index.toString(),
        chatType: rand(Object.values(CONST.REPORT.CHAT_TYPE)),
        currency: rand(Object.values(CONST.CURRENCY)),
        displayName: randWord(),
        ownerAccountID: index,
        isPinned: randBoolean(),
        isOptimisticReport: randBoolean(),
        isOwnPolicyExpenseChat: randBoolean(),
        isWaitingOnBankAccount: randBoolean(),
        policyID: index.toString(),
        reportName: randWord(),
    };
}
