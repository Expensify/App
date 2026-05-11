import type {FileObject} from '@src/types/utils/Attachment';

type CameraProps = {
    /** Called when a file is captured or selected, with the file object and its source URI */
    onCapture: (file: FileObject, source: string) => void;

    /** Whether the gallery/file picker should accept multiple files at once */
    shouldAcceptMultipleFiles?: boolean;

    /** Called when the camera view finishes layout */
    onLayout?: () => void;

    /** Called to validate user-selected files (drag-and-drop or file picker) */
    onDrop?: (files: FileObject[], items: DataTransferItem[]) => void;

    /** Whether we are replacing an existing receipt (affects drop zone icon/title on desktop) */
    isReplacingReceipt?: boolean;

    /** Whether a file is being dragged over a parent wrapper (used by desktop for dual drag-over providers) */
    isDraggingOverWrapper?: boolean;

    /** Called when the native camera finishes initializing (useful for preloading subsequent screens) */
    onCameraInitialized?: () => void;

    /** Called when the attachment picker opens or closes (useful for showing/hiding a full-screen loader) */
    onAttachmentPickerStatusChange?: (isOpen: boolean) => void;
};

export default CameraProps;
export type {CameraProps};
