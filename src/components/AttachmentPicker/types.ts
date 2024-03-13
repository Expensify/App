import type {ReactNode} from 'react';
import type {ValueOf} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import type CONST from '@src/CONST';

type PickerOptions = {
    onPicked: (file: FileObject) => void;
    onCanceled?: () => void;
};

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
};

export default AttachmentPickerProps;
