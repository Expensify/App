import type CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import type {StyleProp, ViewStyle} from 'react-native';
import type {TupleToUnion} from 'type-fest';

type UploadFileProps = {
    /** Text displayed on button when no file is uploaded */
    buttonText: string;

    uploadedFiles: FileObject[];
    onUpload: (files: FileObject[]) => void;
    onRemove: (fileUri: string) => void;
    acceptedFileTypes: Array<TupleToUnion<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>>;

    /** Styles to be assigned to Container */
    style?: StyleProp<ViewStyle>;

    /** Text to display on error message */
    errorText?: string;

    /** Function called whenever option changes */
    onInputChange?: (value: FileObject[]) => void;

    /** Function to set error message */
    setError: (error: string) => void;

    /** Whether to allow multiple files to be selected. */
    fileLimit?: number;

    totalFilesSizeLimit?: number;

    /** The maximum size of a single file that can be selected. */
    maxFileSize?: number;

    /** Read out by screen readers for the upload button in place of its text, such as to name the document it asks for */
    accessibilityLabel?: string;

    /** Whether each file's remove button reaches the 44x44 minimum touch target past its icon */
    shouldExtendRemoveTouchArea?: boolean;
};

export default UploadFileProps;
