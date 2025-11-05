import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CARD_ID: 'cardID',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ReportVirtualCardFraudForm = Form<
    InputID,
    {
        [INPUT_IDS.CARD_ID]: string;
    }
>;

export type {ReportVirtualCardFraudForm};
export {INPUT_IDS};
