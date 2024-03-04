import {useEffect} from 'react';
import type UseDefaultDragAndDrop from './types';

const useDefaultDragAndDrop: UseDefaultDragAndDrop = () => {
    useEffect(() => {
        const dropDragListener = (event: DragEvent) => {
            event.preventDefault();

            if (event.dataTransfer) {
                // eslint-disable-next-line no-param-reassign
                event.dataTransfer.dropEffect = 'none';
            }
        };

        document.addEventListener('dragover', dropDragListener);
        document.addEventListener('dragenter', dropDragListener);
        document.addEventListener('dragleave', dropDragListener);
        document.addEventListener('drop', dropDragListener);

        return () => {
            document.removeEventListener('dragover', dropDragListener);
            document.removeEventListener('dragenter', dropDragListener);
            document.removeEventListener('dragleave', dropDragListener);
            document.removeEventListener('drop', dropDragListener);
        };
    }, []);
};

export default useDefaultDragAndDrop;
