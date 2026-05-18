import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    VALUE: 'value',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceTaxValueForm = Form<
    InputID,
    {
        [INPUT_IDS.VALUE]: string;
    }
>;

export type {WorkspaceTaxValueForm};
export default INPUT_IDS;
