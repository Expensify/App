import type {FileObject} from '@src/types/utils/Attachment';

type CameraProps = {
    /** Called when a file is captured or selected, with the file object and its source URI */
    onCapture: (file: FileObject, source: string) => void;

    /** Whether the gallery/file picker should accept multiple files at once */
    shouldAcceptMultipleFiles?: boolean;

    /** Called when the camera view finishes layout */
    onLayout?: () => void;

    /**
     * Called when files are selected from the gallery picker (native), the file picker (web),
     * or dropped onto the upload zone (desktop web). Files must be validated by the consumer
     * before being treated as receipts; the camera shutter path stays on `onCapture`.
     */
    onPicked: (files: FileObject[], items?: DataTransferItem[]) => void;

    /** Whether we are replacing an existing receipt (affects drop zone icon/title on desktop) */
    isReplacingReceipt?: boolean;

    /** Called when the attachment picker opens or closes (useful for showing/hiding a full-screen loader) */
    onAttachmentPickerStatusChange?: (isOpen: boolean) => void;

    /** Called when the user taps the multi-scan submit button on the preview ribbon. Used by native and mobile web. */
    onMultiScanSubmit?: () => void;
};

export default CameraProps;
export type {CameraProps};
