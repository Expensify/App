import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    FREQUENCY: 'frequency',
    OFFSET: 'offset',
    SECOND_OFFSET: 'secondOffset',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceSubmissionFrequencyForm = Form<
    InputID,
    {
        [INPUT_IDS.FREQUENCY]: string;
        [INPUT_IDS.OFFSET]: string;
        [INPUT_IDS.SECOND_OFFSET]: string;
    }
>;

export type {WorkspaceSubmissionFrequencyForm};
export default INPUT_IDS;
