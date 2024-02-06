import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    REPORT_DESCRIPTION: 'reportDescription',
} as const;

type ReportDescriptionForm = Form<{
    [INPUT_IDS.REPORT_DESCRIPTION]: string;
}>;

export default ReportDescriptionForm;
export {INPUT_IDS};
