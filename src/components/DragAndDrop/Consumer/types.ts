import type {ReactNode} from 'react';

type DragAndDropConsumerProps = {
    children: ReactNode;

    /** Function to execute when an item is dropped in the drop zone. */
    onDrop?: (event: DragEvent) => void;
};

export default DragAndDropConsumerProps;
