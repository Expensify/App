import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateNetSuiteQuickStartExportDate = {
    policyID: string;
    value: ValueOf<typeof CONST.NSQS_CONFIG.EXPORT_DATE>;
};

export default UpdateNetSuiteQuickStartExportDate;
