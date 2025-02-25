import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
    CURRENCY: 'currency',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceConfirmationForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
        [INPUT_IDS.CURRENCY]: string;
    }
>;

export type {WorkspaceConfirmationForm};
export default INPUT_IDS;
