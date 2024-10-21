import type {ReactNode} from 'react';
import type {ValueOf} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import type CONST from '@src/CONST';

type PickerOptions = {
    /** A callback that will be called with the selected attachment. */
    onPicked: (files: FileObject[]) => void;
    /** A callback that will be called without a selected attachment. */
    onCanceled?: () => void;
};

/**
 * A function used to open a picker with specified options.
 *
 * @param options - The options for the picker, including callbacks for handling picked file and cancellation.
 */
type OpenPickerFunction = (options: PickerOptions) => void;

type AttachmentPickerProps = {
    /**
     * A renderProp with the following interface
     *
     * @example
     * <AttachmentPicker>
     * {({openPicker}) => (
     *     <Button
     *         onPress={() => {
     *             openPicker({
     *                 onPicked: (file) => {
     *                     // Display or upload File
     *                 },
     *             });
     *         }}
     *     />
     * )}
     * </AttachmentPicker>
     * */
    children: (props: {openPicker: OpenPickerFunction}) => ReactNode;

    /** The types of files that can be selected with this picker. */
    type?: ValueOf<typeof CONST.ATTACHMENT_PICKER_TYPE>;

    acceptedFileTypes?: Array<ValueOf<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>>;

    shouldHideCameraOption?: boolean;

    shouldHideGalleryOption?: boolean;

    /** Whether to validate the image and show the alert or not. */
    shouldValidateImage?: boolean;

    /** Whether to allow multiple files to be selected. */
    fileLimit?: number;

    /** The total size limit of the files that can be selected. */
    totalFilesSizeLimitInMB?: number;
};

export default AttachmentPickerProps;
