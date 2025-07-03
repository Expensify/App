import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import type {BeneficialOwnerDataKey} from '@src/types/form/ReimbursementAccountForm';

type SaveCorpayOnboardingBeneficialOwnerParams = {
    inputs: string;
    beneficialOwnerIDs?: string;
    bankAccountID: number;
    [key: BeneficialOwnerDataKey]: FileObject;
};

export default SaveCorpayOnboardingBeneficialOwnerParams;
