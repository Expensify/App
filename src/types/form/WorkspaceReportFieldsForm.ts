import type {ValueOf} from 'type-fest';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
    TYPE: 'type',
    INITIAL_VALUE: 'initialValue',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceReportFieldsForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
        [INPUT_IDS.TYPE]: PolicyReportFieldType;
        [INPUT_IDS.INITIAL_VALUE]: string;
    }
>;

export type {WorkspaceReportFieldsForm};
export default INPUT_IDS;
