import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = {
    INTEGRATION_NAME: 'integrationName',
    DIMENSION_TYPE: 'dimensionType',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SageIntacctDimensionForm = Form<
    InputID,
    {
        [INPUT_IDS.INTEGRATION_NAME]: string;
        [INPUT_IDS.DIMENSION_TYPE]: typeof CONST.SAGE_INTACCT_MAPPING_VALUE.TAG | typeof CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD;
    }
>;

export type {SageIntacctDimensionForm};
export default INPUT_IDS;
