import type {FileObject} from '@src/types/utils/Attachment';

type UpdateWiseOnboardingAdditionalDataParams = {
    bankAccountID: number;

    /** The onboarding page the answers belong to, such as `representative` or `business` */
    step: string;

    /** JSON of the page's answers under flat keys, such as `address.city` */
    inputs: string;

    /** JSON of the uploaded file keys the user kept, by field. Left out, the step's files stay as they are. */
    documents?: string;

    /** Sent only through the request path that is not written to disk. Left out, the stored SSN is kept. */
    ssn?: string;

    /** New files, as `<field>[<index>]` */
    [fileKey: `${string}[${number}]`]: FileObject;
};

export default UpdateWiseOnboardingAdditionalDataParams;
