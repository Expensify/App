import type {FileObject} from '@src/types/utils/Attachment';

type FinishCorpayBankAccountOnboardingParams = {
    inputs: string;
    achAuthorizationForm?: FileObject;
    bankStatement?: FileObject;
    bankAccountID: number;
};

export default FinishCorpayBankAccountOnboardingParams;
