import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CARD_TITLE: 'cardTitle',
    PROCESSOR_ID: 'processorID',
    BANK_ID: 'bankID',
    COMPANY_ID: 'companyID',
    DISTRIBUTION_ID: 'distributionID',
    DELIVERY_FILE_NAME: 'deliveryFileName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type AddNewCardFeedForm = Form<
    InputID,
    {
        [INPUT_IDS.CARD_TITLE]: string;
        [INPUT_IDS.PROCESSOR_ID]: string;
        [INPUT_IDS.BANK_ID]: string;
        [INPUT_IDS.COMPANY_ID]: string;
        [INPUT_IDS.DISTRIBUTION_ID]: string;
        [INPUT_IDS.DELIVERY_FILE_NAME]: string;
    }
>;

export type {AddNewCardFeedForm};
export default INPUT_IDS;
