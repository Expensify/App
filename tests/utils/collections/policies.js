"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createRandomPolicy;
exports.createCategoryTaxExpenseRules = createCategoryTaxExpenseRules;
var falso_1 = require("@ngneat/falso");
var CONST_1 = require("@src/CONST");
function createRandomPolicy(index, type, name) {
    return {
        id: index.toString(),
        name: name !== null && name !== void 0 ? name : (0, falso_1.randWord)(),
        type: type !== null && type !== void 0 ? type : (0, falso_1.rand)(Object.values(CONST_1.default.POLICY.TYPE)),
        autoReporting: (0, falso_1.randBoolean)(),
        isPolicyExpenseChatEnabled: (0, falso_1.randBoolean)(),
        autoReportingFrequency: (0, falso_1.rand)(Object.values(CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES).filter(function (frequency) {
            return frequency !== CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
        })),
        harvesting: {
            enabled: (0, falso_1.randBoolean)(),
        },
        autoReportingOffset: 1,
        preventSelfApproval: (0, falso_1.randBoolean)(),
        outputCurrency: (0, falso_1.randCurrencyCode)(),
        role: (0, falso_1.rand)(Object.values(CONST_1.default.POLICY.ROLE)),
        owner: (0, falso_1.randEmail)(),
        ownerAccountID: index,
        avatarURL: (0, falso_1.randAvatar)(),
        isFromFullPolicy: (0, falso_1.randBoolean)(),
        lastModified: (0, falso_1.randPastDate)().toISOString(),
        pendingAction: (0, falso_1.rand)(Object.values(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION)),
        errors: {},
        customUnits: {},
        errorFields: {},
        approvalMode: (0, falso_1.rand)(Object.values(CONST_1.default.POLICY.APPROVAL_MODE)),
    };
}
function createCategoryTaxExpenseRules(category, taxCode) {
    return [
        {
            applyWhen: [{ condition: 'matches', field: 'category', value: category }],
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
