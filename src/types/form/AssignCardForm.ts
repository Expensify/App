import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    START_DATE: 'startDate',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type AssignCardForm = Form<
    InputID,
    {
        [INPUT_IDS.START_DATE]: string;
    }
>;

// eslint-disable-next-line import/prefer-default-export
export type {AssignCardForm};
