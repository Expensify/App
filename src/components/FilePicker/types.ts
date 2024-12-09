import type {ReactNode} from 'react';
import type {FileObject} from '@components/AttachmentModal';

type PickerOptions = {
    /** A callback that will be called with the selected file. */
    onPicked: (file: FileObject) => void;

    /** A callback that will be called without a selected file. */
    onCanceled?: () => void;
};

/**
 * A function used to open a picker with specified options.
 *
 * @param options - The options for the picker, including callbacks for handling picked file and cancellation.
 */
type OpenPickerFunction = (options: PickerOptions) => void;

type FilePickerProps = {
    /**
     * A renderProp with the following interface
     *
     * @example
     * <FilePicker>
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
     * </FilePicker>
     * */
    children: (props: {openPicker: OpenPickerFunction}) => ReactNode;

    /** A string of acceptable file types. */
    acceptableFileTypes?: string;
};

export default FilePickerProps;
