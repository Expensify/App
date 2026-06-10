import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    FIRST_NAME: 'firstName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type EditAgentNameForm = Form<
    InputID,
    {
        [INPUT_IDS.FIRST_NAME]: string;
    }
>;

export type {EditAgentNameForm};
export default INPUT_IDS;
