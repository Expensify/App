type DragAndDropParams = {
    dropZone: React.MutableRefObject<HTMLDivElement | null>;
    onDrop?: (event: DragEvent) => void;
    shouldAllowDrop?: boolean;
    isDisabled?: boolean;
    shouldAcceptDrop?: (event: DragEvent) => boolean;
};

type DragAndDropResult = {
    isDraggingOver: boolean;
};

type UseDragAndDrop = (params: DragAndDropParams) => DragAndDropResult;

export default UseDragAndDrop;
