import {ReactNode} from 'react';

type DragAndDropConsumerProps = {
    /** Children to render inside this component. */
    children: ReactNode;

    /** Function to execute when an item is dropped in the drop zone. */
    onDrop: (event: DragEvent) => void;
};

export default DragAndDropConsumerProps;
