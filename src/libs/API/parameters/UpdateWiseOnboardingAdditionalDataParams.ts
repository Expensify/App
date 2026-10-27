import type {FileObject} from '@src/types/utils/Attachment';

type UpdateWiseOnboardingAdditionalDataParams = {
    bankAccountID: number;

    /** The onboarding page being saved */
    step: string;

    /** That page's answers as JSON, keyed by field */
    inputs: string;

    /** Each uploaded file as its own parameter, named `<fieldKey>_<index>`, since a request carries only files and plain values */
    [fileKey: string]: FileObject | string | number;
};

export default UpdateWiseOnboardingAdditionalDataParams;
