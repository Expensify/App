import type {WriteCapability} from '@src/types/onyx/Report';

type UpdateReportWriteCapabilityParams = {
    reportID: string;
    writeCapability: WriteCapability;
};

export default UpdateReportWriteCapabilityParams;
