import type {FileObject} from '@src/types/utils/Attachment';

type EnableGlobalReimbursementsForUSDBankAccountParams = {
    inputs: string;
    achAuthorizationForm?: FileObject;
    bankAccountID: number;
};

export default EnableGlobalReimbursementsForUSDBankAccountParams;
