import {useEffect} from 'react';

export default function useDefaultDragAndDrop() {
    useEffect(() => {
        const dropDragListener = (event) => {
            event.preventDefault();
            // eslint-disable-next-line no-param-reassign
            event.dataTransfer.dropEffect = 'none';
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
}
