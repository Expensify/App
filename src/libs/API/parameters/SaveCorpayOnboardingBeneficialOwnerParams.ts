import type {BeneficialOwnerDataKey} from '@src/types/form/ReimbursementAccountForm';
import type {FileObject} from '@src/types/utils/Attachment';

type SaveCorpayOnboardingBeneficialOwnerParams = {
    inputs: string;
    beneficialOwnerIDs?: string;
    bankAccountID: number;
    [key: BeneficialOwnerDataKey]: FileObject;
};

export default SaveCorpayOnboardingBeneficialOwnerParams;
