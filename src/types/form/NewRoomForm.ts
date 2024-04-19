import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    ROOM_NAME: 'roomName',
    REPORT_DESCRIPTION: 'reportDescription',
    POLICY_ID: 'policyID',
    WRITE_CAPABILITY: 'writeCapability',
    VISIBILITY: 'visibility',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type NewRoomForm = Form<
    InputID,
    {
        [INPUT_IDS.ROOM_NAME]: string;
        [INPUT_IDS.REPORT_DESCRIPTION]: string;
        [INPUT_IDS.POLICY_ID]: string;
        [INPUT_IDS.WRITE_CAPABILITY]: string;
        [INPUT_IDS.VISIBILITY]: string;
    }
>;

export type {NewRoomForm};
export default INPUT_IDS;
