import type {ValueOf} from 'type-fest';
import type {NetSuiteCustomFieldMapping} from '@src/types/onyx/Policy';
import type Form from './Form';

const INPUT_IDS = {
    INTERNAL_ID: 'internalID',
    MAPPING: 'mapping',
    LIST_NAME: 'listName',
    SEGMENT_NAME: 'segmentName',
    TRANSACTION_FIELD_ID: 'transactionFieldID',
    SCRIPT_ID: 'scriptID',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type NetSuiteCustomFieldForm = Form<
    InputID,
    {
        [INPUT_IDS.INTERNAL_ID]: string;
        [INPUT_IDS.MAPPING]: NetSuiteCustomFieldMapping;
        [INPUT_IDS.LIST_NAME]: string;
        [INPUT_IDS.SEGMENT_NAME]: string;
        [INPUT_IDS.TRANSACTION_FIELD_ID]: string;
        [INPUT_IDS.SCRIPT_ID]: string;
    }
>;

export type {NetSuiteCustomFieldForm};
export default INPUT_IDS;
