import {useEffect} from 'react';

export default function useDefaultDragAndDrop() {
    const dropDragListener = (event) => {
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.dataTransfer.dropEffect = 'none';
    };

    useEffect(() => {
        document.addEventListener('dragover', dropDragListener);
        document.addEventListener('dragenter', dropDragListener);
        document.addEventListener('dragleave', dropDragListener);
        document.addEventListener('drop', dropDragListener);
    }, []);
}
