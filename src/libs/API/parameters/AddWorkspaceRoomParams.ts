import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {WriteCapability} from '@src/types/onyx/Report';

type AddWorkspaceRoomParams = {
    reportID: string;
    createdReportActionID: string;
    policyID?: string;
    reportName?: string;
    visibility?: ValueOf<typeof CONST.REPORT.VISIBILITY>;
    writeCapability?: WriteCapability;
    description?: string;
};

export default AddWorkspaceRoomParams;
