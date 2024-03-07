import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
    VALUE: 'value',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceNewTaxForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
        [INPUT_IDS.VALUE]: string;
    }
>;

export type {WorkspaceNewTaxForm};
export default INPUT_IDS;
