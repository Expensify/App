import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';

/**
 * Maps an IOU type to the Search data type the submitted expense lands in: invoices surface under the
 * Invoice tab, everything else under Expense. Used by both the pre-mount route decision and the
 * submit-dismiss handlers so the two stay in agreement about which Search tab to reveal.
 */
function getSubmitExpenseSearchType(iouType: IOUType): typeof CONST.SEARCH.DATA_TYPES.INVOICE | typeof CONST.SEARCH.DATA_TYPES.EXPENSE {
    return iouType === CONST.IOU.TYPE.INVOICE ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;
}

export default getSubmitExpenseSearchType;
