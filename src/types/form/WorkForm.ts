import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    WORK: 'work',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkForm = Form<
    InputID,
    {
        [INPUT_IDS.WORK]: string;
    }
>;

export type {WorkForm};
export default INPUT_IDS;
