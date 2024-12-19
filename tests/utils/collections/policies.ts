import {rand, randAvatar, randBoolean, randCurrencyCode, randEmail, randPastDate, randWord} from '@ngneat/falso';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

export default function createRandomPolicy(index: number, type?: ValueOf<typeof CONST.POLICY.TYPE>): Policy {
    return {
        id: index.toString(),
        name: randWord(),
        type: type ?? rand(Object.values(CONST.POLICY.TYPE)),
        autoReporting: randBoolean(),
        isPolicyExpenseChatEnabled: randBoolean(),
        autoReportingFrequency: rand(
            Object.values(CONST.POLICY.AUTO_REPORTING_FREQUENCIES).filter(
                (frequency): frequency is Exclude<ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>, typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL> =>
                    frequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL,
            ),
        ),
        harvesting: {
            enabled: randBoolean(),
        },
        autoReportingOffset: 1,
        preventSelfApproval: randBoolean(),
        outputCurrency: randCurrencyCode(),
        role: rand(Object.values(CONST.POLICY.ROLE)),
        owner: randEmail(),
        ownerAccountID: index,
        avatarURL: randAvatar(),
        isFromFullPolicy: randBoolean(),
        lastModified: randPastDate().toISOString(),
        pendingAction: rand(Object.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
        errors: {},
        customUnits: {},
        errorFields: {},
        approvalMode: rand(Object.values(CONST.POLICY.APPROVAL_MODE)),
    };
}

function createCategoryTaxExpenseRules(category: string, taxCode: string) {
    return [
        {
            applyWhen: [{condition: 'matches', field: 'category', value: category}],
            id: '1',
            tax: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                field_id_TAX: {
                    externalID: taxCode,
                },
            },
        },
    ];
}

export {createCategoryTaxExpenseRules};
