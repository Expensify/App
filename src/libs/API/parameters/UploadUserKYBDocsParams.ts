import type {FileObject} from '@src/types/utils/Attachment';

type UploadUserKYBDocsParams = {
    bankAccountID: number;
    companyTaxID?: FileObject;
    nameChangeDocument?: FileObject;
    companyAddressVerification?: FileObject;
    userAddressVerification?: FileObject;
    userDOBVerification?: FileObject;
};

export default UploadUserKYBDocsParams;
