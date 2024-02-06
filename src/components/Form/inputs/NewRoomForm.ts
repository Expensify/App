import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    ROOM_NAME: 'roomName',
    REPORT_DESCRIPTION: 'reportDescription',
    POLICY_ID: 'policyID',
    WRITE_CAPABILITY: 'writeCapability',
    VISIBILITY: 'visibility',
} as const;

type NewRoomForm = Form<{
    [INPUT_IDS.ROOM_NAME]: string;
    [INPUT_IDS.REPORT_DESCRIPTION]: string;
    [INPUT_IDS.POLICY_ID]: string;
    [INPUT_IDS.WRITE_CAPABILITY]: string;
    [INPUT_IDS.VISIBILITY]: string;
}>;

export default NewRoomForm;
export {INPUT_IDS};
