import type {FileObject} from '@components/AttachmentModal';
import type {BeneficialOwnerDataKey} from '@src/types/form/ReimbursementAccountForm';

type SaveCorpayOnboardingBeneficialOwnerParams = {
    inputs: string;
    beneficialOwnerIDs?: string;
    bankAccountID: number;
    [key: BeneficialOwnerDataKey]: FileObject;
};

export default SaveCorpayOnboardingBeneficialOwnerParams;
