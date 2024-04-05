import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    REPORT_DESCRIPTION: 'reportDescription',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ReportDescriptionForm = Form<
    InputID,
    {
        [INPUT_IDS.REPORT_DESCRIPTION]: string;
    }
>;

export type {ReportDescriptionForm};
export default INPUT_IDS;
