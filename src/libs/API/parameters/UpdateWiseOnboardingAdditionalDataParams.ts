import type CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ValueOf} from 'type-fest';

type UpdateWiseOnboardingAdditionalDataParams = {
    bankAccountID: number;

    /** The onboarding page the answers belong to. The server answers any other step with 400 Invalid step. */
    step: ValueOf<typeof CONST.WISE.ONBOARDING_STEP>;

    /** JSON of the page's answers under flat keys, such as `address.city`. It holds a typed SSN, so it is redacted from the logs. */
    inputs: string;

    /** JSON of the uploaded file keys the user kept, by field. Left out, the step's files stay as they are. */
    documents?: string;

    /** New files, as `<field>[<index>]` */
    [fileKey: `${string}[${number}]`]: FileObject;
};

export default UpdateWiseOnboardingAdditionalDataParams;
