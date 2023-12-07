import {ReactNode} from 'react';

type DragAndDropProviderProps = {
    /** Children to render inside this component. */
    children: ReactNode;

    /** Should this dropZone be disabled? */
    isDisabled?: boolean;

    /** Indicate that users are dragging file or not */
    setIsDraggingOver: (value: boolean) => void;
};

type SetOnDropHandlerCallback = (event: DragEvent) => void;

type DragAndDropContextParams = {
    /** Whether something is dragging over a drop zone. */
    isDraggingOver?: boolean;

    /** Execute callback when an item is dropped in the drop zone. */
    setOnDropHandler?: (callback: SetOnDropHandlerCallback) => void;

    /** Drop zone id. */
    dropZoneID?: string;
};

export type {DragAndDropProviderProps, DragAndDropContextParams, SetOnDropHandlerCallback};
