import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DESTINATION: 'destination',
    SUBRATE: 'subrate',
    AMOUNT: 'amount',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspacePerDiemForm = Form<
    InputID,
    {
        [INPUT_IDS.DESTINATION]: string;
        [INPUT_IDS.SUBRATE]: string;
        [INPUT_IDS.AMOUNT]: string;
    }
>;

export type {WorkspacePerDiemForm};
export default INPUT_IDS;
