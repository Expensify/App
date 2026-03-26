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
};

export default CameraProps;
export type {CameraProps};
