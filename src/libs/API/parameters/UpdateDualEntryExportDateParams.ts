import type {DualEntryExportDate} from '@src/types/onyx/Policy';

type UpdateDualEntryExportDateParams = {
    /** Workspace whose export date is updated. */
    policyID: string;

    /** Date source used for exported vendor bills. */
    value: DualEntryExportDate;
};

export default UpdateDualEntryExportDateParams;
