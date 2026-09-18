import type {FileObject} from '@src/types/utils/Attachment';

/** Files travel as `<fieldKey>_<index>` multipart parts; every other answer is inside the submissionData JSON */
type WiseKYCFileParamKey = `${string}_${number}`;

type SubmitWiseKYCRequirementParams = {
    bankAccountID: number;
    requirementKey: string;
    submissionData: string;
    [fileKey: WiseKYCFileParamKey]: FileObject;
};

export default SubmitWiseKYCRequirementParams;
export type {WiseKYCFileParamKey};
