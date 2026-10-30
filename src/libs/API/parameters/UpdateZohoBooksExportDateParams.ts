import type {ZohoBooksExportDate} from '@src/types/onyx/Policy';

type UpdateZohoBooksExportDateParams = {
    policyID: string;
    value: ZohoBooksExportDate;
};

export default UpdateZohoBooksExportDateParams;
