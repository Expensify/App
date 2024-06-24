import type {ValueOf} from 'type-fest';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
    TYPE: 'type',
    INITIAL_VALUE: 'initialValue',
    LIST_VALUES: 'listValues',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;
type ReportFieldListValue = {name: string; disabled: boolean};
type ReportFieldListValues = Record<string, ReportFieldListValue>;

type WorkspaceReportFieldsForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
        [INPUT_IDS.TYPE]: PolicyReportFieldType;
        [INPUT_IDS.INITIAL_VALUE]: string;
        [INPUT_IDS.LIST_VALUES]: ReportFieldListValues;
    }
>;

export type {WorkspaceReportFieldsForm, ReportFieldListValue, ReportFieldListValues};
export default INPUT_IDS;
