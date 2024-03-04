import type {ReactNode} from 'react';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

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
    children: (openPicker: ({onPicked, onCanceled}: {onPicked: (file: File) => void; onCanceled?: () => void}) => void) => ReactNode;

    /** The types of files that can be selected with this picker. */
    type?: ValueOf<typeof CONST.ATTACHMENT_PICKER_TYPE>;
};

export default AttachmentPickerProps;