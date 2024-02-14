import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DATE_TIME: 'dateTime',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type SettingsStatusClearDateForm = Form<
    InputIDs,
    {
        [INPUT_IDS.DATE_TIME]: string;
    }
>;

export type {SettingsStatusClearDateForm};
export default INPUT_IDS;
