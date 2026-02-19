import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    RATE: 'rate',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceTimeTrackingDefaultRateForm = Form<
    InputID,
    {
        [INPUT_IDS.RATE]: string;
    }
>;

export type {WorkspaceTimeTrackingDefaultRateForm};
export default INPUT_IDS;
