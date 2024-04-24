type DragAndDropParams = {
    dropZone: React.MutableRefObject<HTMLDivElement | null>;
    onDrop?: (event: DragEvent) => void;
    shouldAllowDrop?: boolean;
    isDisabled?: boolean;
    shouldAcceptDrop?: (event: DragEvent) => boolean;
};

type DragAndDropOptions = {
    isDraggingOver: boolean;
};

type UseDragAndDrop = (params: DragAndDropParams) => DragAndDropOptions;

export default UseDragAndDrop;
