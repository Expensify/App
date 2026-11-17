import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    FIRST_NAME: 'firstName',
    PROMPT: 'prompt',
    ROLE: 'role',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type AddAgentForm = Form<
    InputID,
    {
        [INPUT_IDS.FIRST_NAME]: string;
        [INPUT_IDS.PROMPT]: string;
        [INPUT_IDS.ROLE]: ValueOf<typeof CONST.POLICY.ROLE>;
    }
>;

export type {AddAgentForm};
export default INPUT_IDS;
