import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DEFAULT_TITLE: 'defaultTitle',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ReportsDefaultTitleModalForm = Form<
    InputID,
    {
        [INPUT_IDS.DEFAULT_TITLE]: string;
    }
>;

export type {ReportsDefaultTitleModalForm};
export default INPUT_IDS;
