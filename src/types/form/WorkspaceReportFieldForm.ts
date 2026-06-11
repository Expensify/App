import type {ValueOf} from 'type-fest';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
    TYPE: 'type',
    INITIAL_VALUE: 'initialValue',
    LIST_VALUES: 'listValues',
    DISABLED_LIST_VALUES: 'disabledListValues',
    VALUE_NAME: 'valueName',
    NEW_VALUE_NAME: 'newValueName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceReportFieldForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
        [INPUT_IDS.TYPE]: PolicyReportFieldType;
        [INPUT_IDS.INITIAL_VALUE]: string;
        [INPUT_IDS.LIST_VALUES]: string[];
        [INPUT_IDS.DISABLED_LIST_VALUES]: boolean[];
        [INPUT_IDS.VALUE_NAME]: string;
        [INPUT_IDS.NEW_VALUE_NAME]: string;
    }
>;

export type {WorkspaceReportFieldForm, InputID};
export default INPUT_IDS;
