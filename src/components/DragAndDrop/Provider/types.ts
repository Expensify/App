import type {ReactNode} from 'react';

type DragAndDropProviderProps = {
    /** Children to render inside this component. */
    children: ReactNode;

    /** Should this dropZone be disabled? */
    isDisabled?: boolean;

    /** Indicate that users are dragging file or not */
    setIsDraggingOver?: (value: boolean) => void;
};

type SetOnDropHandlerCallback = (event: DragEvent) => void;

type DragAndDropStateContextType = {
    /** Whether something is dragging over a drop zone. */
    isDraggingOver: boolean;

    /** Drop zone id for the portal host. */
    dropZoneID: string;
};

type DragAndDropActionsContextType = {
    /** Register the callback to run when an item is dropped in the drop zone. */
    setOnDropHandler: (callback: SetOnDropHandlerCallback) => void;
};

export type {DragAndDropProviderProps, SetOnDropHandlerCallback, DragAndDropStateContextType, DragAndDropActionsContextType};
