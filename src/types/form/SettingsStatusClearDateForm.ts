import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DATE_TIME: 'dateTime',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SettingsStatusClearDateForm = Form<
    InputID,
    {
        [INPUT_IDS.DATE_TIME]: string;
    }
>;

export type {SettingsStatusClearDateForm};
export default INPUT_IDS;
