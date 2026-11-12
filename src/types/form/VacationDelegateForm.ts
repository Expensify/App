import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    /** Delegate picked on the member selection screen, before it is saved */
    DELEGATE: 'delegate',

    /** Day (yyyy-MM-dd) the vacation delegate clears on, in the timezone of the person setting it */
    CLEAR_AFTER_DATE: 'clearAfterDate',

    /** Time the vacation delegate clears at on that day, in the timezone of the person setting it. Stored as yyyy-MM-dd HH:mm:ss by the time picker, but only the time is used. */
    CLEAR_AFTER_TIME: 'clearAfterTime',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type VacationDelegateForm = Form<
    InputID,
    {
        [INPUT_IDS.DELEGATE]: string;
        [INPUT_IDS.CLEAR_AFTER_DATE]: string;
        [INPUT_IDS.CLEAR_AFTER_TIME]: string;
    }
>;

export type {VacationDelegateForm};
export default INPUT_IDS;
