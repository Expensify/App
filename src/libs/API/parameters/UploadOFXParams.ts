import type {FileObject} from '@src/types/utils/Attachment';

type UploadOFXParams = {
    /** The raw OFX/QFX statement, parsed server side */
    file: FileObject;

    /** Optimistic cardID the statement imports into */
    cardID: number;

    /** Display name for the card */
    cardName: string;

    /** Whether the transactions are reimbursable */
    reimbursable: boolean;
};

export default UploadOFXParams;
