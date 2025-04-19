
exports.__esModule = true;
exports.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES = exports.getRouteForCurrentStep = void 0;
const CONST_1 = require('@src/CONST');

const REIMBURSEMENT_ACCOUNT_ROUTE_NAMES = {
    COMPANY: 'company',
    PERSONAL_INFORMATION: 'personal-information',
    BENEFICIAL_OWNERS: 'beneficial-owners',
    CONTRACT: 'contract',
    VALIDATE: 'validate',
    ENABLE: 'enable',
    NEW: 'new',
};
exports.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES = REIMBURSEMENT_ACCOUNT_ROUTE_NAMES;
function getRouteForCurrentStep(currentStep) {
    switch (currentStep) {
        case CONST_1['default'].BANK_ACCOUNT.STEP.COMPANY:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.COMPANY;
        case CONST_1['default'].BANK_ACCOUNT.STEP.REQUESTOR:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.PERSONAL_INFORMATION;
        case CONST_1['default'].BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.BENEFICIAL_OWNERS;
        case CONST_1['default'].BANK_ACCOUNT.STEP.ACH_CONTRACT:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.CONTRACT;
        case CONST_1['default'].BANK_ACCOUNT.STEP.VALIDATION:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.VALIDATE;
        case CONST_1['default'].BANK_ACCOUNT.STEP.ENABLE:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.ENABLE;
        case CONST_1['default'].BANK_ACCOUNT.STEP.BANK_ACCOUNT:
        default:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW;
    }
}
exports.getRouteForCurrentStep = getRouteForCurrentStep;
